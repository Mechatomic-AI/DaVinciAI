export function ChainString() {
  const chainString = "77Zzsjy3tWrm6QkudwRpkyaCHUGK8D6bFAVjfU8Fpump"

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
