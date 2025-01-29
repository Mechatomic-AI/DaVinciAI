export function BackgroundImage() {
  return (
    <div
      className="fixed inset-0 -z-10 bg-black"
      style={{
        backgroundImage: 'url(/images/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}
