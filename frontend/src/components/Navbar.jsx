import SignInButton from "./SignInButton";

export default function Navbar({ openSignUp }) {
  return (
    <nav className="top-0 left-0 w-full flex items-start justify-between px-10 py-5 bg-black/90 backdrop-blur-sm z-50">

      <div className="text-white font-bold text-xl">PhoneSphere</div>

      <div className="hidden md:flex space-x-10 text-white font-medium items-start">
        <a className="hover:text-gray-300" href="#store">Store</a>
        <a className="hover:text-gray-300" href="#features">Features</a>
        <a className="hover:text-gray-300" href="#service">Service</a>
        <a className="hover:text-gray-300" href="#support">Support</a>
        <a className="hover:text-gray-300" href="#faq">FAQ</a>
      </div>

      <SignInButton onClick={openSignUp} />
    </nav>
  );
}
