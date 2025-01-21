import { motion } from "motion/react";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { Left, Right } from "~/Icons";
import { ActionButton } from "./ActionButtons";

export function Pagination({
  firstItemData,
  lastItemData,
  firstItemOfPage,
  lastItemOfPage,
}: {
  firstItemOfPage: number;
  lastItemOfPage: number;
  firstItemData: number;
  lastItemData: number;
}) {
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (firstItemData === firstItemOfPage) {
      setSearchParams({});
    }
  }, [firstItemData, firstItemOfPage]);
  return (
    <div className="flex space-x-4 items-center px-4">
      <ActionButton
        onClick={() => {
          console.log({
            action: "prev",
            id: firstItemOfPage.toString(),
          });
          setSearchParams({
            action: "prev",
            id: firstItemOfPage.toString(),
          });
        }}
        disabled={firstItemData === firstItemOfPage}
      >
        <Left />
      </ActionButton>
      <ActionButton
        onClick={() =>
          setSearchParams({
            action: "next",
            id: lastItemOfPage.toString(),
          })
        }
        disabled={lastItemData === lastItemOfPage}
      >
        <Right />
      </ActionButton>
    </div>
  );
}

