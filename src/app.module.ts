import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
//modules
import { ProfileModule } from './profile/profile.module';
//import { CertificateModule } from './certificate/certificate.module';
//entities
import { Profile } from './profile/entities/profile.entity';
import { Certificate } from './certificate/entities/certificate.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes env available everywhere
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // make sure ConfigModule is available
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        ssl: {
          rejectUnauthorized: false, // for development only!
        },
        entities: [Profile,Certificate],
        synchronize: true,
      }),
    }),
    ProfileModule,
    //CertificateModule,
  ],
})
export class AppModule {}
