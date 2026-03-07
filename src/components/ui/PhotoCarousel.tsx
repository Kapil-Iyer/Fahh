// Activity images - use placeholder until real assets are added
const placeholderImg = "/placeholder.svg";
const leftCards = [
  { img: placeholderImg, label: "Basketball Pickup" },
  { img: placeholderImg, label: "Coffee Meetup" },
  { img: placeholderImg, label: "Study Group" },
  { img: placeholderImg, label: "Sunset Hike" },
];

const rightCards = [
  { img: placeholderImg, label: "Game Night" },
  { img: placeholderImg, label: "Cooking Class" },
  { img: placeholderImg, label: "Jam Session" },
  { img: placeholderImg, label: "Art Workshop" },
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
      <div className={direction === "up" ? "animate-scroll-up hover:animate-scroll-up-slow" : "animate-scroll-down hover:animate-scroll-down-slow"}>
        {doubled.map((card, i) => (
          <div key={i} className="p-3">
            <div className="rounded-2xl overflow-hidden shadow-card-hover relative group">
              <img
                src={card.img}
                alt={card.label}
                width={192}
                height={256}
                className="object-cover w-48 h-64 transition-transform duration-500 group-hover:scale-110"
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