import Image from "next/image";

import basketballImg from "@/assets/activity-basketball.jpg";
import coffeeImg from "@/assets/activity-coffee.jpg";
import studyImg from "@/assets/activity-study.jpg";
import hikingImg from "@/assets/activity-hiking.jpg";
import gamingImg from "@/assets/activity-gaming.jpg";
import cookingImg from "@/assets/activity-cooking.jpg";
import musicImg from "@/assets/activity-music.jpg";
import artImg from "@/assets/activity-art.jpg";

const leftCards = [
  { img: basketballImg, label: "Basketball Pickup" },
  { img: coffeeImg, label: "Coffee Meetup" },
  { img: studyImg, label: "Study Group" },
  { img: hikingImg, label: "Sunset Hike" },
];

const rightCards = [
  { img: gamingImg, label: "Game Night" },
  { img: cookingImg, label: "Cooking Class" },
  { img: musicImg, label: "Jam Session" },
  { img: artImg, label: "Art Workshop" },
];

function CardColumn({
  cards,
  direction,
}: {
  cards: typeof leftCards;
  direction: "up" | "down";
}) {
  const doubled = [...cards, ...cards];

  return (
    <div className="h-full overflow-hidden relative">
      <div className={direction === "up" ? "animate-scroll-up" : "animate-scroll-down"}>
        {doubled.map((card, i) => (
          <div key={i} className="p-3">
            <div className="rounded-2xl overflow-hidden shadow-card-hover relative group">
              <Image
                src={card.img}
                alt={card.label}
                width={192}
                height={256}
                className="object-cover w-48 h-64 transition-transform duration-500 group-hover:scale-110"
                priority
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <span className="text-white text-sm font-semibold">
                  {card.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PhotoCarousel() {
  return (
    <>
      <div className="absolute left-0 top-0 bottom-0 w-56 opacity-60 hidden md:block">
        <CardColumn cards={leftCards} direction="up" />
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-56 opacity-60 hidden md:block">
        <CardColumn cards={rightCards} direction="down" />
      </div>
    </>
  );
}