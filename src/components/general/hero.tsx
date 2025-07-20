export default function Hero() {
  return (
    <div className="relative h-screen overflow-hidden bg-white text-white">
      <div className="absolute inset-0">
        <img
          src="/jit/images/hero.jpg"
          alt="Background Image"
          className="h-full w-full object-cover object-center"
        />
        <div className=" absolute inset-0 bg-black opacity-20"></div>
      </div>

      <div className="relative z-10 m-2 flex h-full flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-3xl font-bold leading-tight text-black lg:text-5xl">
          Welcome to JIT Finance Analyzer
        </h1>
        <p className="mb-8 text-sm text-black lg:text-lg">
          Discover amazing features and services that await you.
        </p>
        <div className="flex gap-2">
          <a
            href="/jit/auth/login"
            className="transform rounded-full bg-primary px-6 py-2 text-lg font-semibold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-hover hover:shadow-lg"
          >
            Get Started{" "}
            {/* Account Login | Go to My Space | Proceed to Login | Enter Portal | Access Account | Sign In */}
          </a>
        </div>
      </div>
    </div>
  );
}
