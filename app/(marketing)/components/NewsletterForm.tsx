'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { joinWaitlist } from '../actions';

export function NewsletterForm() {
  const t = useTranslations('marketing.newsletter');
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    startTransition(async () => {
      const result = await joinWaitlist(email);
      if (result.success) {
        setIsSuccess(true);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <AnimatePresence mode="wait">
      {isSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex w-full flex-col items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-5 text-center"
        >
          <CheckCircle className="h-6 w-6 text-emerald-400" />
          <p className="text-sm font-medium text-emerald-300">
            You're on the list!
          </p>
          <p className="text-xs text-white/40">
            We'll reach out when it's your turn. Keep an eye on your inbox.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          ref={formRef}
          onSubmit={handleSubmit}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex w-full gap-2"
        >
          <input
            name="email"
            type="email"
            required
            placeholder={t('placeholder')}
            aria-label={t('ariaLabel')}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none backdrop-blur-sm transition-colors focus:border-pink-500/50 focus:bg-white/8"
          />
          <button
            type="submit"
            disabled={isPending}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#E60076] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#ff1a8e] hover:shadow-[0_0_30px_rgba(230,0,118,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="relative z-10">
              {isPending ? 'Joining...' : t('submit')}
            </span>
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
