export function Card({ className="", ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-2xl border bg-white shadow-sm ${className}`} {...p} />
}
export function Button({ className="", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`px-3 py-2 rounded-xl border shadow-sm hover:opacity-90 disabled:opacity-50 ${className}`} {...p} />
}
export function Input({ className="", ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`w-full px-3 py-2 border rounded-xl ${className}`} {...p} />
}
export function Select({ className="", ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`w-full px-3 py-2 border rounded-xl ${className}`} {...p} />
}
export function Badge({ children, color="gray" }:{children:React.ReactNode;color?:"gray"|"green"|"amber"|"red"|"blue"}) {
  const map:any={gray:"bg-gray-100 text-gray-800",green:"bg-green-100 text-green-800",amber:"bg-amber-100 text-amber-800",red:"bg-red-100 text-red-800",blue:"bg-blue-100 text-blue-800"}
  return <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${map[color]}`}>{children}</span>
}
