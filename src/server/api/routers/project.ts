import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const ProjectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubURL: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubURL: input.githubURL,
          userToProjects: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });
      return project;
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: {
            //checks if there exists at least one record
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });
  }),
});
