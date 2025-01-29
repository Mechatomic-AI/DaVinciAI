export function ChainString() {
  const chainString = "SOON"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(chainString)
  }

  return (
    <button
      onClick={copyToClipboard}
      className="text-lg font-mono hover:opacity-80 transition-opacity cursor-pointer neon-glow whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] md:max-w-full"
      title="Click to copy"
    >
      CA : {chainString}
    </button>
  )
}
