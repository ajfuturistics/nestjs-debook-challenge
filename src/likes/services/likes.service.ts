import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Like } from '../entities/like.entity';
import { PostsService } from '../../posts/services/posts.service';

export class PostLikedEvent {
    constructor(
        public readonly postId: string,
        public readonly userId: string,
        public readonly postOwnerId: string,
    ) { }
}

@Injectable()
export class LikesService {
    constructor(
        @InjectRepository(Like)
        private readonly likesRepository: Repository<Like>,
        private readonly postsService: PostsService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    private readonly logger = new Logger(LikesService.name);

    async toggleLike(userId: string, postId: string): Promise<{ status: 'liked' | 'unliked' }> {
        // Check if post exists
        const post = await this.postsService.getPostById(postId);
        if (!post) {
            throw new NotFoundException(`Post with ID ${postId} not found`);
        }

        // Check if like already exists to determine action
        const existingLike = await this.likesRepository.findOne({
            where: { userId, postId },
        });

        if (existingLike) {
            // Case: User Liked -> Want to Unlike
            await this.likesRepository.remove(existingLike);
            await this.postsService.decrementLikeCount(postId);

            this.logger.log(`User: ${userId} | Post: ${postId} | Unliked post`);

            return { status: 'unliked' };
        } else {
            // Case: User Not Liked -> Want to Like
            const like = this.likesRepository.create({
                userId,
                postId,
            });

            try {
                await this.likesRepository.save(like);

                // Atomically increment counter
                await this.postsService.incrementLikeCount(postId);

                // Emit event for async notification processing
                // Don't notify if user is liking their own post
                if (post.userId !== userId) {
                    this.eventEmitter.emit(
                        'post.liked',
                        new PostLikedEvent(postId, userId, post.userId),
                    );
                }

                this.logger.log(`User: ${userId} | Post: ${postId} | Liked post`);
                return { status: 'liked' };

            } catch (error) {
                // Handle unique constraint violation (race condition)
                if (error.code === '23505') {
                    // They liked it while we were processing. So now it is liked.
                    // If we wanted strict toggle, we might need retry, but 'liked' is a safe state to return here.
                    return { status: 'liked' };
                }
                throw error;
            }
        }
    }

    async hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
        const count = await this.likesRepository.count({
            where: { userId, postId },
        });
        return count > 0;
    }
}
