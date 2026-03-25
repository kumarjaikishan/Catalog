import { useEffect, useState } from 'react'

const Slideshow = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [images.length])

  if (!images || images.length === 0) {
    return (
      <div className="absolute inset-0 z-[-1] bg-[linear-gradient(135deg,#7c2d12_0%,#c2410c_45%,#0f4c81_100%)] opacity-20"></div>
    )
  }

  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden">
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-30' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40"></div>
    </div>
  )
}

export default Slideshow
