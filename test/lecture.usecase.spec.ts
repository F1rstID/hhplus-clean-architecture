// test/lecture.usecases.spec.ts

import { LectureUsecases } from '../src/application/usecases/lecture.usecases';
import { LectureService } from '../src/domain/services/lecture.service';
import { TransactionService } from '../src/infrastructure/prisma/transaction.service';
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterLectureResDto } from '../src/interfaces/api/dtos/register-lecture.dto';
import { Prisma, User } from '@prisma/client';
import { UserService } from '../src/domain/services/user.service';

describe('LectureUsecase', () => {
  let lectureUsecases: LectureUsecases;
  let lectureServiceMock: jest.Mocked<LectureService>;
  let userServiceMock: jest.Mocked<UserService>;
  let transactionServiceMock: jest.Mocked<TransactionService>;
  let mockTx: jest.Mocked<Prisma.TransactionClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LectureUsecases,
        {
          provide: LectureService,
          useValue: {
            registerLecture: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: { findUser: jest.fn(), verifyUser: jest.fn() },
        },
        {
          provide: TransactionService,
          useValue: {
            run: jest.fn(),
          },
        },
      ],
    }).compile();

    lectureUsecases = module.get<LectureUsecases>(LectureUsecases);
    lectureServiceMock = module.get<LectureService>(
      LectureService,
    ) as jest.Mocked<LectureService>;
    userServiceMock = module.get<UserService>(
      UserService,
    ) as jest.Mocked<UserService>;
    transactionServiceMock = module.get<TransactionService>(
      TransactionService,
    ) as jest.Mocked<TransactionService>;

    mockTx = {
      lecture: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      userLecture: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      // 필요한 다른 모델들도 여기에 추가
    } as unknown as jest.Mocked<Prisma.TransactionClient>;
  });

  describe('register', () => {
    const lectureId = 1;
    const userId = 1;

    it('특강 신청에 성공할 경우 { success: true }를 반환해야 한다.', async () => {
      userServiceMock.findUser.mockResolvedValue({ id: userId });
      userServiceMock.verifyUser.mockImplementation((user: User) => {
        if (!user) throw new Error('존재 하지 않는 사용자입니다.');
      });

      lectureServiceMock.registerLecture.mockResolvedValue(undefined);

      transactionServiceMock.run.mockImplementation(async (callback) => {
        await callback(mockTx);
      });

      const result: RegisterLectureResDto = await lectureUsecases.register(
        lectureId,
        userId,
      );

      expect(result).toEqual({ success: true });

      expect(transactionServiceMock.run).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.run).toHaveBeenCalledWith(
        expect.any(Function),
      );

      expect(lectureServiceMock.registerLecture).toHaveBeenCalledTimes(1);
      expect(lectureServiceMock.registerLecture).toHaveBeenCalledWith(
        lectureId,
        userId,
        mockTx,
      );
    });

    it('유저가 존재하지 않을 경우 에러를 던져야 한다.', async () => {
      userServiceMock.findUser.mockResolvedValue(null);
      userServiceMock.verifyUser.mockImplementation((user: User) => {
        if (!user) throw new Error('존재 하지 않는 사용자입니다.');
      });

      await expect(lectureUsecases.register(lectureId, userId)).rejects.toThrow(
        '존재 하지 않는 사용자입니다.',
      );

      expect(userServiceMock.findUser).toHaveBeenCalledTimes(1);
      expect(userServiceMock.findUser).toHaveBeenCalledWith(userId);
    });
  });
});
