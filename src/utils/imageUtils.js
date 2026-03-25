/**
 * Resizes an image to a maximum width of 500px and converts it to WebP format.
 * @param {File} file - The image file to process.
 * @returns {Promise<{base64: string, name: string}>}
 */
export const processImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 500
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to WebP with 0.8 quality
        const dataUrl = canvas.toDataURL('image/webp', 0.8)
        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
        
        resolve({
          base64: dataUrl,
          name: newName
        })
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}
