"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
    title: string;
    instructor: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    imageSrc: string;
    duration: string;
    category: string;
}

export function CourseCard({
    title,
    instructor,
    progress,
    totalLessons,
    completedLessons,
    imageSrc,
    duration,
    category
}: CourseCardProps) {
    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all border-none shadow-sm">
            <div className="relative h-40 w-full overflow-hidden">
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-primary">
                    {category}
                </div>
            </div>
            <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{instructor}</p>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{completedLessons}/{totalLessons} Lessons</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground border-t bg-slate-50/50 mt-2">
                <div className="flex items-center gap-4 py-3">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {duration}
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {totalLessons} Lectures
                    </div>
                </div>
                <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10 p-0 h-auto font-medium">
                    Continue
                </Button>
            </CardFooter>
        </Card>
    );
}
