import SignInButton from "./SignInButton";
export default function Navbar() {
  return (
    <nav className="top-0 left-0 w-full flex items-center justify-between px-10 py-5 bg-transparent backdrop-blur-sm z-50">
      <div className="text-white font-bold text-xl tracking-tight">
        PhoneSphere
      </div>

      <div className="hidden md:flex space-x-10 text-gray-300 font-medium">
        <a href="#pricing" className="hover:text-white transition-colors duration-200">Store</a>
        <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
        <a href="#pricing" className="hover:text-white transition-colors duration-200">Service</a>
        <a href="#pricing" className="hover:text-white transition-colors duration-200">Support</a>
        <a href="#faq" className="hover:text-white transition-colors duration-200">FAQ</a>
      </div>

      <SignInButton />
    </nav>
  );
}
