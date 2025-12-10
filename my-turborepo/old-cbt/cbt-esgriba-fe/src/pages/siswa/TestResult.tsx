import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { CheckCircle, Home, FileText, Sparkles, Award } from "lucide-react";
import { useEffect, useState } from "react";

export default function TestResult() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animasi masuk
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 px-4 py-6 md:px-6 md:py-10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-75"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-150"></div>
      </div>

      <div
        className={`mx-auto max-w-2xl relative z-10 transition-all duration-700 transform ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <Card className="overflow-hidden border-0 shadow-sm bg-white/95 backdrop-blur-sm">
          {/* Success Confetti Header */}
          <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white overflow-hidden">
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white/40" />
                </div>
              ))}
            </div>

            <div className="relative z-10 text-center">
              <div className="flex justify-center p-2">
                <img
                  src="/mantap.png"
                  alt="Mantap"
                  className="w-full max-w-lg object-contain rounded-md shadow-md"
                />
              </div>
            </div>
          </div>

          <CardHeader className="text-center space-y-4 pt-8 pb-6">
            <CardTitle className="text-xl md:text-2xl font-bold text-slate-900">
              Jawaban Anda Telah Tersimpan
            </CardTitle>
            <p className="mx-auto max-w-md text-sm md:text-base text-slate-600 leading-relaxed">
              Terima kasih telah menyelesaikan ujian dengan baik. Semua jawaban
              Anda telah berhasil dikirim dan tercatat dalam sistem.
            </p>
          </CardHeader>

          <CardContent className="pb-8">
            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Status</p>
                  <p className="text-sm font-bold text-blue-900">Selesai</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600 font-medium">
                    Jawaban
                  </p>
                  <p className="text-sm font-bold text-emerald-900">
                    Tersimpan
                  </p>
                </div>
              </div>
            </div>

            {/* Motivational Message */}

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:gap-4">
              <Button
                onClick={() => navigate("/")}
                size="lg"
                className="w-full md:w-auto rounded-full px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Home className="mr-2 h-4 w-4" /> Kembali ke Beranda
              </Button>
              <Button
                onClick={() => navigate("/tests")}
                size="lg"
                variant="outline"
                className="w-full md:w-auto rounded-full px-6 border-2 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
              >
                <FileText className="mr-2 h-4 w-4" /> Lihat Daftar Ujian
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <p className="text-center mt-6 text-sm text-slate-500">
          Hasil ujian akan diumumkan setelah guru menilai jawaban Anda
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
