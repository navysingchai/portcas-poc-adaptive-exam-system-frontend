export default function LoadingSpinner() {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-dark"
        >
            <div className="text-center">
                <div
                    className="inline-block w-10 h-10 border-4 rounded-full animate-spin mb-4 border-accent border-t-transparent"
                ></div>
                <p className="text-lg text-light">กำลังโหลด...</p>
            </div>
        </div>
    );
}
