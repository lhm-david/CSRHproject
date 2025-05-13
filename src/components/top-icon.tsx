import Image from 'next/image';

export default function TopIcon(){
    return(
        <>
        <div className="w-full bg-black p-4 flex justify-center rounded-lg">
            <Image
              src="https://chubbyskewers.com/wp-content/uploads/2025/03/Image_20250326151332.png"
              alt="Chubby Skewers Logo"
              width={250}
              height={250}
              className="rounded-full"
              data-ai-hint="restaurant logo"
            />
            
          </div>
          {/* <h1 className="text-2xl font-bold">Chubby Skewer Management platform</h1> */}
        </>
    )
}