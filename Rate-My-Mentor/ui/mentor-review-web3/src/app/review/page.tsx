"use client";

import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_MENTOR_DETAIL } from "@/data/detail-mock";
import Link from "next/link";

export default function ReviewPage() {
  const mentors = Object.values(MOCK_MENTOR_DETAIL).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">发布评价</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        选择 Mentor、点击评价按钮进入 Mentor 详情页面、填写评分与文字评价；AI 自动分析提取标签和评分；提交后上链或存证。
      </p>

      <div className="mt-8 space-y-8">
        {/* 选择 Mentor */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">选择 Mentor</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{mentor.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {mentor.title}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < Math.floor(mentor.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {mentor.rating} ({mentor.reviewCount} 条评价)
                      </span>
                    </div>
                  </div>
                  <Link href={`/mentor/${encodeURIComponent(mentor.id)}`}>
                    <Button size="sm">
                      评价
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 提示信息 */}
        <div>
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 点击 "评价" 按钮进入 Mentor 详情页面，在详情页面点击 "写评价" 按钮即可评价该 Mentor。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
