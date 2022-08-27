import { prisma } from "./client";

export const getVideo = async ({ id }: { id: string }) => {
  return await prisma.video.findFirst({
    where: { id },
  });
};

export const getAllUsersVideos = async ({
  userId,
  limit,
  start,
}: {
  userId: string;
  limit?: number;
  start?: number;
}) => {
  return await prisma.video.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: start,
  });
};

export const updateViewCount = async ({
  id,
  amount,
}: {
  id: string;
  amount: number;
}) => {
  return await prisma.video.update({
    where: { id },
    data: {
      views: { increment: amount },
    },
  });
};

export const deleteVideo = async ({ id }: { id: string }) => {
  return await prisma.video.delete({
    where: { id },
  });
};
