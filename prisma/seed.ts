import { Prisma, PrismaClient } from '@prisma/client';
import { User } from '../src/domain/entities/user.entity';

function getRandomItem<T>(items: T[]): T {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

function getRandomTimeWithinDay() {
  const minHour = 0;
  const maxHour = 23;
  const randomHour =
    Math.floor(Math.random() * (maxHour - minHour + 1)) + minHour;

  return randomHour;
}

function getRandomDatesWithinLastThreeDays(count) {
  const dates = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const randomDayOffset = Math.floor(Math.random() * 3); // 지난 3일 중 하루 선택
    const date = new Date();
    date.setDate(now.getDate() - randomDayOffset); // 과거 n일 전 날짜 설정

    const randomHour = getRandomTimeWithinDay();
    date.setHours(randomHour, 0, 0, 0); // 랜덤한 시간, 분, 초, 밀리초는 0

    dates.push(date);
  }

  return dates;
}

const prisma = new PrismaClient();
async function main() {
  const mentors = [
    '로이',
    '렌',
    '타일러',
    '토투',
    '김종협',
    '허재',
    '하현우',
    '이석범',
  ];

  const dates = getRandomDatesWithinLastThreeDays(mentors.length);

  const languages = ['Nest.js', 'JAVA', 'Kotlin'];

  const users: User[] = Array.from({ length: 1000 }, (_, i) => ({ id: i + 1 }));

  const speakers: Prisma.SpeakerCreateManyInput[] = Array.from(
    { length: mentors.length },
    (_, i) => ({
      id: i + 1,
      name: mentors[i],
    }),
  );

  const lectures: Prisma.LectureCreateManyInput[] = Array.from(
    { length: mentors.length },
    (_, i) => ({
      id: i + 1,
      speakerId: i + 1,
      title: `${mentors[i]}와 함께하는 ${getRandomItem(languages)} 강의`,
      description: `${mentors[i]}의 강의에 오신 여러분 환영합니다.`,
      capacity: 30,
      date: getRandomItem(dates),
    }),
  );

  await prisma.user.createMany({ data: users });
  await prisma.speaker.createMany({ data: speakers });
  await prisma.lecture.createMany({ data: lectures });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
