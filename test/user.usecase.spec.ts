// test/user.usecases.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserUsecases } from '../src/application/usecases/user.usecases';
import { UserService } from '../src/domain/services/user.service';
import { LectureMapper } from '../src/infrastructure/prisma/lecture.mapper';
import { User } from '@prisma/client';
import { UserNotFoundException } from '../src/interfaces/api/common/exceptions/user-not-found.exception';

describe('UserUsecases', () => {
  let userUsecases: UserUsecases;
  let userServiceMock: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserUsecases,
        {
          provide: UserService,
          useValue: {
            myLectures: jest.fn(),
            findUser: jest.fn(),
            verifyUser: jest.fn(),
          },
        },
      ],
    }).compile();

    userUsecases = module.get<UserUsecases>(UserUsecases);
    userServiceMock = module.get<UserService>(
      UserService,
    ) as jest.Mocked<UserService>;
  });

  describe('myLectures', () => {
    const userId = 1;

    it('사용자가 존재하지 않을 경우 에러를 반환해야 한다.', async () => {
      userServiceMock.findUser.mockResolvedValue(null);
      userServiceMock.verifyUser.mockImplementation((user: User) => {
        if (!user) throw new UserNotFoundException();
      });

      await expect(userUsecases.myLectures(userId)).rejects.toThrowError(
        '존재하지 않는 사용자입니다.',
      );

      expect(userServiceMock.findUser).toHaveBeenCalledTimes(1);
      expect(userServiceMock.findUser).toHaveBeenCalledWith(userId);
    });

    it('사용자의 강의 목록을 성공적으로 반환해야 한다.', async () => {
      // 가상의 강의 목록 생성
      const lectureStubs = [
        {
          id: 1,
          speakerId: 1,
          title: 'Title 1',
          description: 'Description 1',
          date: new Date(),
          registeredCount: 10,
          capacity: 30,
        },
        {
          id: 2,
          speakerId: 2,
          title: 'Title 2',
          description: 'Description 2',
          date: new Date(),
          registeredCount: 5,
          capacity: 25,
        },
      ].map((lecture) => LectureMapper.toDomain(lecture));

      userServiceMock.myLectures.mockResolvedValue(lectureStubs);

      // 메서드 실행
      const result = await userUsecases.myLectures(userId);

      // 결과 검증
      expect(result).toEqual(lectureStubs);

      expect(userServiceMock.myLectures).toHaveBeenCalledTimes(1);
      expect(userServiceMock.myLectures).toHaveBeenCalledWith(userId);
    });

    it('사용자의 강의 목록이 없을 경우 빈 배열을 반환해야 한다.', async () => {
      userServiceMock.myLectures.mockResolvedValue([]);

      const result = await userUsecases.myLectures(userId);

      expect(result).toEqual([]);

      expect(userServiceMock.myLectures).toHaveBeenCalledTimes(1);
      expect(userServiceMock.myLectures).toHaveBeenCalledWith(userId);
    });
  });
});
