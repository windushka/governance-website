interface NoDataProps {
  text:string;
}

export default function NoData({ text: children }: NoDataProps) {
  return <div className="flex justify-center items-center grow text-slate-400 text-xl">
    {children}
  </div>
}