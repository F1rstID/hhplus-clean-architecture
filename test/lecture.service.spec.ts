import { LectureService } from '../src/domain/services/lecture.service';
import { LectureRepository } from '../src/interfaces/repositories/lecture.repository.interface';
import { TransactionService } from '../src/infrastructure/prisma/transaction.service';
import { Test, TestingModule } from '@nestjs/testing';
import { LectureMapper } from '../src/infrastructure/prisma/lecture.mapper';
import { Prisma } from '@prisma/client';
import { UserLectureMapper } from '../src/infrastructure/prisma/user-lecture.mapper';
import { RedlockService } from '../src/infrastructure/redis/redlock.service';

describe('LectureService', () => {
  let lectureService: LectureService;
  let lectureRepositoryMock: jest.Mocked<LectureRepository>;
  let redlockServiceMock: jest.Mocked<RedlockService>;
  let transactionServiceMock: jest.Mocked<TransactionService>;
  let mockTx: jest.Mocked<Prisma.TransactionClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LectureService,
        {
          provide: 'LectureRepository',
          useValue: {
            findLecturesByDate: jest.fn(),
            findLecture: jest.fn(),
            findUserLecture: jest.fn(),
            registerLecture: jest.fn(),
            increaseRegisteredCount: jest.fn(),
          },
        },
        { provide: TransactionService, useValue: { run: jest.fn() } },
        {
          provide: RedlockService,
          useValue: {
            redlock: {
              using: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    //

    lectureService = module.get<LectureService>(LectureService);
    lectureRepositoryMock = module.get('LectureRepository');
    redlockServiceMock = module.get<RedlockService>(RedlockService);
    transactionServiceMock = module.get(TransactionService);

    mockTx = {
      lecture: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      userLecture: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    } as unknown as jest.Mocked<Prisma.TransactionClient>;
  });

  describe('findAvailableLectures', () => {
    it('조회한 날짜의 강의만 조회되어야 한다.', async () => {
      const currentDate = new Date('2024-11-11T09:00:00.000Z');

      const lectureStubs = [
        {
          id: 1,
          speakerId: 1,
          title: 'title 1',
          description: 'description 1',
          date: new Date(currentDate.setDate(currentDate.getDate())),
          registeredCount: 0,
          capacity: 30,
        },
        {
          id: 2,
          speakerId: 2,
          title: 'title 2',
          description: 'description 2',
          date: new Date(currentDate.setHours(currentDate.getHours() + 1)),
          registeredCount: 0,
          capacity: 30,
        },
        {
          id: 3,
          speakerId: 3,
          title: 'title 3',
          description: 'description 3',
          date: new Date(currentDate.setDate(currentDate.getDate() - 1)),
          registeredCount: 0,
          capacity: 30,
        },
      ].map((lecture) => LectureMapper.toDomain(lecture));

      console.log(lectureStubs);

      lectureRepositoryMock.findLecturesByDate.mockImplementation(
        (startDate: Date, endDate: Date) => {
          return Promise.resolve(
            lectureStubs.filter(
              (lecture) => lecture.date >= startDate && lecture.date <= endDate,
            ),
          );
        },
      );

      const currentDateString = '2024-11-11';

      const result =
        await lectureService.findAvailableLectures(currentDateString);

      expect(result).toEqual([lectureStubs[0], lectureStubs[1]]);
    });
    it('조회한 날짜의 강의 중 정원이 초과된 강의는 조회되지 않아야 한다.', async () => {
      const currentDate = new Date();

      const lectureStubs = [
        {
          id: 1,
          speakerId: 1,
          title: 'title 1',
          description: 'description 1',
          date: new Date(currentDate.setHours(currentDate.getHours() + 1)),
          registeredCount: 31,
          capacity: 30,
        },
      ].map((lecture) => LectureMapper.toDomain(lecture));

      lectureRepositoryMock.findLecturesByDate.mockImplementation(
        (startDate: Date, endDate: Date) => {
          return Promise.resolve(
            lectureStubs.filter(
              (lecture) => lecture.date >= startDate && lecture.date <= endDate,
            ),
          );
        },
      );

      const currentDateString = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;

      const result =
        await lectureService.findAvailableLectures(currentDateString);

      expect(result).toEqual([]);
    });
  });

  describe('registerLecture', () => {
    it('강의를 등록하면 강의의 등록자 수가 1 증가해야 한다.', async () => {
      const lectureId = 1;
      const userId = 1;

      const lectureStub = LectureMapper.toDomain({
        id: lectureId,
        speakerId: 1,
        title: 'title',
        description: 'description',
        date: new Date(),
        registeredCount: 0,
        capacity: 30,
      });

      lectureRepositoryMock.findLecture.mockImplementation(
        (lectureId: number) => {
          return Promise.resolve(lectureStub);
        },
      );

      lectureRepositoryMock.findUserLecture.mockImplementation(
        (lectureId: number, userId: number) => {
          return Promise.resolve(null);
        },
      );

      lectureRepositoryMock.registerLecture.mockImplementation(
        (lectureId: number, userId: number, tx: Prisma.TransactionClient) => {
          return Promise.resolve(
            UserLectureMapper.toDomain({
              lectureId,
              userId,
              id: lectureId,
            }),
          );
        },
      );

      lectureRepositoryMock.increaseRegisteredCount.mockImplementation(
        (lectureId: number, tx: Prisma.TransactionClient) => {
          return Promise.resolve(
            LectureMapper.toDomain({
              ...lectureStub,
              registeredCount: lectureStub.registeredCount + 1,
            }),
          );
        },
      );

      transactionServiceMock.run.mockImplementation(async (callback) => {
        await callback(mockTx);
      });

      const redlockUsingMock = redlockServiceMock.redlock.using as jest.Mock;

      redlockUsingMock.mockImplementation(
        async (resources, duration, settingsOrRoutine, maybeRoutine) => {
          const routine =
            typeof settingsOrRoutine === 'function'
              ? settingsOrRoutine
              : maybeRoutine;
          await routine();
        },
      );

      await lectureService.registerLecture(lectureId, userId);

      expect(redlockUsingMock).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.run).toHaveBeenCalledTimes(1);
      expect(lectureRepositoryMock.increaseRegisteredCount).toBeCalledWith(
        lectureId,
        mockTx,
      );
    });
    it('이미 등록된 강의는 등록할 수 없다.', async () => {
      const lectureId = 1;
      const userId = 1;

      const lectureStub = LectureMapper.toDomain({
        id: lectureId,
        speakerId: 1,
        title: 'title',
        description: 'description',
        date: new Date(),
        registeredCount: 10,
        capacity: 30,
      });

      const userLectureStub = UserLectureMapper.toDomain({
        id: 1,
        userId,
        lectureId,
      });

      lectureRepositoryMock.findLecture.mockImplementation((id: number) => {
        return Promise.resolve(lectureStub);
      });

      transactionServiceMock.run.mockImplementation(async (callback) => {
        await callback(mockTx);
      });

      const redlockUsingMock = redlockServiceMock.redlock.using as jest.Mock;

      redlockUsingMock.mockImplementation(
        async (resources, duration, settingsOrRoutine, maybeRoutine) => {
          const routine =
            typeof settingsOrRoutine === 'function'
              ? settingsOrRoutine
              : maybeRoutine;
          await routine();
        },
      );

      lectureRepositoryMock.findUserLecture.mockResolvedValue(userLectureStub);

      await expect(
        lectureService.registerLecture(lectureId, userId),
      ).rejects.toThrow('이미 등록된 특강입니다.');

      expect(redlockUsingMock).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.run).toHaveBeenCalledTimes(1);
      expect(lectureRepositoryMock.registerLecture).not.toHaveBeenCalled();
      expect(
        lectureRepositoryMock.increaseRegisteredCount,
      ).not.toHaveBeenCalled();
    });

    it('존재하지 않는 강의는 등록할 수 없다.', async () => {
      const lectureId = 999;
      const userId = 1;
      lectureRepositoryMock.findLecture.mockResolvedValue(null);

      transactionServiceMock.run.mockImplementation(async (callback) => {
        await callback(mockTx);
      });

      const redlockUsingMock = redlockServiceMock.redlock.using as jest.Mock;

      redlockUsingMock.mockImplementation(
        async (resources, duration, settingsOrRoutine, maybeRoutine) => {
          const routine =
            typeof settingsOrRoutine === 'function'
              ? settingsOrRoutine
              : maybeRoutine;
          await routine();
        },
      );

      await expect(
        lectureService.registerLecture(lectureId, userId),
      ).rejects.toThrow('존재하지 않는 특강입니다.');

      // expect(redlockUsingMock).toHaveBeenCalledTimes(1);
      // expect(transactionServiceMock.run).toHaveBeenCalledTimes(1);
      expect(lectureRepositoryMock.findUserLecture).not.toHaveBeenCalled();
      expect(lectureRepositoryMock.registerLecture).not.toHaveBeenCalled();
      expect(
        lectureRepositoryMock.increaseRegisteredCount,
      ).not.toHaveBeenCalled();
    });
    it('강의 정원이 초과된 강의는 등록할 수 없다.', async () => {
      const lectureId = 1;
      const userId = 1;

      const lectureStub = LectureMapper.toDomain({
        id: lectureId,
        speakerId: 1,
        title: 'title',
        description: 'description',
        date: new Date(),
        registeredCount: 30,
        capacity: 30,
      });

      lectureRepositoryMock.findLecture.mockResolvedValue(lectureStub);

      lectureRepositoryMock.findUserLecture.mockResolvedValue(null);

      transactionServiceMock.run.mockImplementation(async (callback) => {
        await callback(mockTx);
      });

      const redlockUsingMock = redlockServiceMock.redlock.using as jest.Mock;

      redlockUsingMock.mockImplementation(
        async (resources, duration, settingsOrRoutine, maybeRoutine) => {
          const routine =
            typeof settingsOrRoutine === 'function'
              ? settingsOrRoutine
              : maybeRoutine;
          await routine();
        },
      );

      await expect(
        lectureService.registerLecture(lectureId, userId),
      ).rejects.toThrow('특강 정원이 초과되었습니다.');

      expect(redlockUsingMock).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.run).toHaveBeenCalledTimes(1);
      expect(lectureRepositoryMock.registerLecture).not.toHaveBeenCalled();
      expect(
        lectureRepositoryMock.increaseRegisteredCount,
      ).not.toHaveBeenCalled();
    });
  });
});
