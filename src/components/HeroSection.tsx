import React from 'react'
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section 
        className="relative min-h-[600px] lg:min-h-[700px] overflow-hidden"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Background overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center min-h-[600px] lg:min-h-[715px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
              {/* Left Content */}
              <div className="space-y-6 z-10">
                <div className="space-y-4">
                  <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#E2418D] to-[#FB7C76] text-body-medium font-medium tracking-wide">
                    Bold & Sporty
                  </p>
                  <h1 className="text-heading-1 lg:leading-[90px] font-bold text-dark-900">
                    Style That Moves
                    With You.
                  </h1>
                  <p className="text-color-dark-900 text-[24px] leading-relaxed">
                    Not just style. Not just comfort. Footwear that effortlessly 
                    moves with your every step.
                  </p>
                </div>
                <Link 
                  href="/products"
                  className="inline-block bg-[#111111] text-light-100 px-8 py-4 rounded-full text-body-medium font-medium hover:bg-dark-700 transition-colors duration-200"
                >
                  Find Your Shoe
                </Link>
              </div>

              {/* Right Content - Shoe Image */}
              <div className="">
                
                {/* Shoe Image */}
                <div className="drop-shadow-2xl">
                  <Image
                    src="/hero-shoe.png"
                    alt="Nike Air Jordan Shoe"
                    width={1000}
                    height={1000}
                    priority
                    className="w-full h-auto object-contain "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default HeroSection