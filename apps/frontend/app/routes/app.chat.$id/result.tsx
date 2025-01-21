import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import type { ShowResultParam } from "@backend-api/om/tools";
import { motion } from "motion/react";



export function ShowResult({result}: ShowResultParam) {
  return (
    <Card className="bg-background">
     
      <CardHeader>
        <CardTitle className="text-text-base">Assessment Results</CardTitle>
        <CardDescription className="text-text-base/80">
          Overview of your self-assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-text-base">
        {result.map((data, index) => {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              key={index}
            >
              <Card className="bg-secondary/30">
                <CardHeader>
                  <CardTitle>{data.category}</CardTitle>
                  <CardDescription>{data.shortCategory}</CardDescription>
                </CardHeader>
                <CardContent>
                  <CardDescription>{data.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
