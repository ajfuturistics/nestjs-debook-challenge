import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostsService } from './services/posts.service';
import { PostsController } from './controllers/posts.controller';
import { LikesModule } from '../likes/likes.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Post]),
        forwardRef(() => LikesModule),
    ],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule { }
