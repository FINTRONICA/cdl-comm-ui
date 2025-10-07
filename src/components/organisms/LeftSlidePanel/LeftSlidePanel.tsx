function LeftSlidePanel({ isOpen, onClose }) {
  return (
    <div
      className={`fixed top-0 right-0 h-[80%] w-115 bg-white shadow-lg z-50 transform transition-all duration-5000 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Slide Panel</h2>
        <button onClick={onClose}>
         X
        </button>
      </div>
      <div className="p-4">
        {/* Panel content goes here */}
        <p>This is a sliding panel from the left!</p>
      </div>
    </div>
  );
}
export default LeftSlidePanel;