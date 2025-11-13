import SignInButton from "./SignInButton";
export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-10 py-5 bg-transparent backdrop-blur-sm z-50">
      {/* Logo / Brand */}
      <div className="text-white font-bold text-xl tracking-tight">
        RepairX
      </div>

      {/* Center Links */}
      <div className="hidden md:flex space-x-10 text-gray-300 font-medium">
        <a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a>
        <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
        <a href="#faq" className="hover:text-white transition-colors duration-200">FAQ</a>
      </div>

      {/* Right Button */}
      <SignInButton />
    </nav>
  );
}
