import Image from "next/image";
import Icon from "@/components/ui/Icon";

export function SurveyHeader() {
  return (
    <header className="relative overflow-hidden bg-orange-600 px-5 pt-5 pb-7 text-white">
      <div className="absolute -top-14 -right-9 size-36 rounded-full border-[20px] border-white/10" />
      <div className="relative flex items-center gap-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white/70 bg-white">
          {/* The artwork is a centred circle on a 16:9 canvas; cover crops the empty sides. */}
          <Image src="/BJP-Symbol.png" alt="" fill sizes="44px" loading="eager" className="object-cover" />
        </div>
        <div>
          <p className="text-base font-extrabold tracking-tight">भारतीय जनता पार्टी</p>
          <p className="mt-0.5 text-xs font-medium text-orange-100">सामाजिक संरचना सर्वेक्षण प्रपत्र | उत्तर प्रदेश</p>
        </div>
      </div>
    </header>
  );
}

export function IntroCard() {
  return (
    <section className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold tracking-[0.16em] text-orange-600 uppercase">बूथ स्तरीय सर्वेक्षण</p>
      <h1 className="mt-2 text-[23px] leading-[1.35] font-black tracking-tight text-slate-950">
        ग्राम पंचायत सामाजिक संरचना सर्वेक्षण प्रपत्र
      </h1>
      <p className="mt-3 text-sm leading-6 font-semibold text-slate-700">
        अपने क्षेत्र के प्रत्येक बूथ का अनुमानित जातिवार मतदाता विवरण दर्ज करें।
      </p>
      <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950">
        <Icon name="info" className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p className="text-[11px] leading-[1.65]">
          यह जानकारी आंतरिक संगठनात्मक विश्लेषण एवं योजना हेतु अनुमानित/सूची-आधारित है। इसे स्वतंत्र रूप से सत्यापित तथ्य
          या किसी व्यक्ति की पहचान/स्थिति का अंतिम निष्कर्ष न माना जाए।
        </p>
      </div>
    </section>
  );
}

export function OfflineBanner() {
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-amber-950"
      role="status"
    >
      <Icon name="wifi" className="mt-0.5 size-5 shrink-0 text-amber-700" />
      <div>
        <p className="text-sm font-bold">आप ऑफ़लाइन हैं</p>
        <p className="mt-0.5 text-xs leading-5">
          भरी गई जानकारी इसी डिवाइस पर सुरक्षित है। सबमिट करने के लिए इंटरनेट से जुड़ें।
        </p>
      </div>
    </div>
  );
}
