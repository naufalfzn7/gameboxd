import React from "react";

const Admin = () => {
  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-neutral-200 p-8 sm:p-10">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center">
                <span className="text-2xl">🔨</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 mb-3">
              Admin Panel
            </h1>
            <p className="text-neutral-600 mb-8">
              Coming soon. Admin features are under development.
            </p>

            <button
              disabled
              className="w-full sm:w-auto bg-neutral-300 text-neutral-600 px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
