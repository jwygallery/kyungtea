import React, { useState } from 'react';
import { ContactConfig, InquirySubmission } from '../types/cms';
import { INQUIRIES_STORAGE_KEY } from '../utils/cmsLogic';

interface ContactViewProps {
  contact: ContactConfig;
}

export const ContactView: React.FC<ContactViewProps> = ({ contact }) => {
  const [organization, setOrganization] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState(
    contact.inquiryTypes[0] || 'B2B 원물 샘플 키트 신청 (Sample Kit Request)'
  );
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState<InquirySubmission | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization.trim() || !contactName.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('모든 필수 입력 항목(소속/상호명, 담당자 성함, 이메일, 문의 내용)을 입력해 주세요.');
      return;
    }

    const record: InquirySubmission = {
      id: `INQ-${Date.now().toString().slice(-6)}`,
      organization: organization.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      inquiryType: inquiryType || contact.inquiryTypes[0] || 'General Inquiry',
      message: message.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    try {
      const existingRaw = localStorage.getItem(INQUIRIES_STORAGE_KEY);
      const list: InquirySubmission[] = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify([record, ...list]));
    } catch {
      // ignore storage errors
    }

    setErrorMsg('');
    setSubmittedRecord(record);
    setOrganization('');
    setContactName('');
    setEmail('');
    setMessage('');
  };

  return (
    <section className="mx-auto w-full max-w-[1440px]">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Dynamic Guidance & Contact Information from localStorage / Admin */}
        <div className="flex flex-col justify-between border-b border-[#141413] p-6 sm:p-10 lg:col-span-5 lg:border-b-0 lg:border-r">
          <div>
            <h1
              className="text-2xl font-semibold leading-snug tracking-tight text-[#141413] sm:text-3xl"
              style={{ textWrap: 'balance' }}
            >
              {contact.title}
            </h1>
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-[#141413]">
              {contact.introText}
            </p>
          </div>

          <dl className="mt-10 divide-y divide-[#141413] border-t border-b border-[#141413] text-xs">
            <div className="py-4">
              <dt className="text-[11px] font-medium tracking-wide text-[#6E706E]">
                Email
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#141413]">
                <a href={`mailto:${contact.email}`} className="hover:underline">
                  {contact.email}
                </a>
              </dd>
            </div>

            <div className="py-4">
              <dt className="text-[11px] font-medium tracking-wide text-[#6E706E]">
                Address
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#141413]">{contact.addressHours}</dd>
            </div>

            <div className="py-4">
              <dt className="text-[11px] font-medium tracking-wide text-[#6E706E]">
                Social
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#141413]">{contact.socialHandle}</dd>
            </div>
          </dl>
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="p-6 sm:p-10 lg:col-span-7">
          {submittedRecord ? (
            <div className="border border-[#141413] bg-[#EAE8E1] p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#141413] tabular-nums">
                DISPATCH CONFIRMED — {submittedRecord.id}
              </div>
              <p className="mt-2 text-sm text-[#141413]">
                문의가 정상적으로 접수되었습니다. 담당 아키비스트가 확인 후 기재하신 이메일(
                <span>{submittedRecord.email}</span>)로 표준 스펙 시트 및 샘플 키트 안내를 회신드립니다.
              </p>
              <dl className="mt-4 space-y-1 border-t border-[#141413]/20 pt-3 text-xs text-[#6E706E]">
                <div>ORGANIZATION: {submittedRecord.organization}</div>
                <div>CONTACT: {submittedRecord.contactName}</div>
                <div>CATEGORY: {submittedRecord.inquiryType}</div>
              </dl>
              <button
                type="button"
                onClick={() => setSubmittedRecord(null)}
                className="mt-5 border border-[#141413] bg-[#141413] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#F4F3EF] cursor-pointer"
              >
                NEW INQUIRY
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {errorMsg && (
                <div
                  role="alert"
                  className="border border-[#141413] bg-[#141413] px-4 py-3 text-xs text-[#F4F3EF]"
                >
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-org"
                    className="block text-[11px] font-medium uppercase tracking-wider text-[#141413]"
                  >
                    ORGANIZATION / BRAND *
                  </label>
                  <input
                    id="contact-org"
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="상호명 또는 기관명"
                    className="mt-1.5 w-full border border-[#141413] bg-[#F4F3EF] px-3.5 py-2.5 text-sm text-[#141413] placeholder:text-[#6E706E] focus:outline-none focus:ring-1 focus:ring-[#141413]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-[11px] font-medium uppercase tracking-wider text-[#141413]"
                  >
                    CONTACT PERSON *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="담당자 성함 / 직함"
                    className="mt-1.5 w-full border border-[#141413] bg-[#F4F3EF] px-3.5 py-2.5 text-sm text-[#141413] placeholder:text-[#6E706E] focus:outline-none focus:ring-1 focus:ring-[#141413]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-[11px] font-medium uppercase tracking-wider text-[#141413]"
                  >
                    EMAIL *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="mt-1.5 w-full border border-[#141413] bg-[#F4F3EF] px-3.5 py-2.5 text-sm text-[#141413] placeholder:text-[#6E706E] focus:outline-none focus:ring-1 focus:ring-[#141413]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-type"
                    className="block text-[11px] font-medium uppercase tracking-wider text-[#141413]"
                  >
                    INQUIRY TYPE *
                  </label>
                  <select
                    id="contact-type"
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="mt-1.5 w-full border border-[#141413] bg-[#F4F3EF] px-3.5 py-2.5 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
                  >
                    {contact.inquiryTypes.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-[11px] font-medium uppercase tracking-wider text-[#141413]"
                >
                  DETAILS *
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 w-full border border-[#141413] bg-[#F4F3EF] p-3.5 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-medium tracking-wider text-[#6E706E] tabular-nums">
                  RESPONSE TIME: 1–2 BUSINESS DAYS
                </span>
                <button
                  type="submit"
                  className="border border-[#141413] bg-[#141413] px-6 py-3 text-xs font-medium uppercase tracking-wider text-[#F4F3EF] hover:bg-[#141413]/85 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  SUBMIT INQUIRY
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
