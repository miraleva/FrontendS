function App() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-600 to-indigo-700">
      <div className="p-8 bg-white rounded-2xl shadow-2xl text-center max-w-sm transform hover:scale-105 transition-all">
        <h1 className="text-3xl font-extrabold text-indigo-600 mb-2">
          Sanny Frontend
        </h1>
        <p className="text-gray-500 font-medium mb-4">
          Proje iskeleti başarıyla kuruldu!
        </p>
        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors">
          Hello Sanny!
        </button>
      </div>
    </div>
  )
}

export default App