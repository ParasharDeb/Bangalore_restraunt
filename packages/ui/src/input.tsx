interface InputProps {
  type: string;
  Changehandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  Title: string;

}

export function Inputbox({ type, Changehandler, placeholder, Title }: InputProps) {
  return (
    <div className="mt-5">
      <label className="block mb-1 font-mono font-semibold text-[#ff7a27] pl-3">{Title}</label>
      <input
        placeholder={placeholder}
        type={type}
        onChange={Changehandler}
        className="w-full px-5 font-mono py-2 h-10 rounded-3xl border border-gray-300 focus:border-[#ff7a27] focus:outline-none"/>
          
    </div>
  );
}
