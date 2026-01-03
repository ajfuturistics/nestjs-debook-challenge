import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostResponseDto } from '../dto/post-response.dto';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,
    ) { }

    private readonly logger = new Logger(PostsService.name);

    async createPost(
        userId: string,
        createPostDto: CreatePostDto,
    ): Promise<PostResponseDto> {
        const post = this.postsRepository.create({
            userId,
            content: createPostDto.content,
            likesCount: 0,
            commentsCount: 0,
        });

        const savedPost = await this.postsRepository.save(post);
        this.logger.log(`User: ${userId} | Created Post: ${savedPost.id}`);
        return new PostResponseDto(savedPost);
    }

    async getAllPosts(limit: number = 20, offset: number = 0): Promise<[PostResponseDto[], number]> {
        const [posts, total] = await this.postsRepository.findAndCount({
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });

        return [posts.map(post => new PostResponseDto(post)), total];
    }

    async getPostById(postId: string): Promise<PostResponseDto> {
        // Efficient query - no joins, just get the post with denormalized counters
        const post = await this.postsRepository.findOne({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException(`Post with ID ${postId} not found`);
        }

        return new PostResponseDto(post);
    }

    async incrementLikeCount(postId: string): Promise<void> {
        // Atomic increment using SQL to avoid race conditions
        await this.postsRepository.increment({ id: postId }, 'likesCount', 1);
    }

    async decrementLikeCount(postId: string): Promise<void> {
        // Atomic decrement using SQL
        await this.postsRepository.decrement({ id: postId }, 'likesCount', 1);
    }

    async postExists(postId: string): Promise<boolean> {
        const count = await this.postsRepository.count({
            where: { id: postId },
        });
        return count > 0;
    }
}
