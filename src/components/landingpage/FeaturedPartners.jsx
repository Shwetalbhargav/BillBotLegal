// src/components/landingpage/FeaturedPartners.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersThunk } from "@/store/usersSlice";

// ---- LOCAL IMAGES ----
import imgAdmin from "@/assets/partner/admin.jpg";
import img1 from "@/assets/partner/partner1.jpg";
import img2 from "@/assets/partner/partner2.jpg";
import img3 from "@/assets/partner/partner3.jpg";

const LOCAL_IMAGES = [imgAdmin, img1, img2, img3];

const FeaturedPartners = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.users || {});

  useEffect(() => {
    if (!list?.length && !loading) {
      dispatch(fetchUsersThunk({ role: "partner", limit: 6 }));
    }
  }, [dispatch, list?.length, loading]);


  const partners = useMemo(() => {
    if (!list?.length) return [];

    const withRole = list.filter((u) =>
      /partner/i.test(
        u.role || u.title || u.position || u.designation || ""
      )
    );

    const source = withRole.length ? withRole : list;

    return source.slice(0, 3).map((u, idx) => {
      const name = u.fullName || u.name || u.displayName || "Senior Partner";
      const title =
        u.title ||
        u.position ||
        (idx === 0
          ? "Senior Partner, Disputes"
          : idx === 1
          ? "Partner, Corporate & M&A"
          : "Partner, Regulatory & Policy");

      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      // Pick avatar
      const avatar =
        u.profile?.avatar ||
        LOCAL_IMAGES[idx] || // fallback to local partner images
        null;

      const practice =
        u.profile?.primaryPracticeArea ||
        u.practiceArea ||
        u.profile?.specialisation ||
        "High-stakes litigation & advisory";

      const chambers =
        u.profile?.court ||
        u.primaryCourt ||
        "Supreme Court of India & key High Courts";

      return {
        id: u.id || u._id || idx,
        name,
        title,
        initials,
        avatar,
        practice,
        chambers,
        mattersLed: u.profile?.mattersLed || (idx + 2) * 120,
      };
    });
  }, [list]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:px-0">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Featured Partners
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            The partners behind the matters.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Seasoned courtroom advocates and deal lawyers who understand billing
            precision and litigation strategy.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {partners.length ? (
          partners.map((p) => <PartnerCard key={p.id} partner={p} />)
        ) : (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </div>
    </div>
  );
};

const PartnerCard = ({ partner }) => {
  const { name, initials, title, avatar, practice, chambers, mattersLed } =
    partner;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">

        {/* Avatar or initials fallback */}
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-14 w-14 rounded-full object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-base font-semibold text-slate-700">
            {initials}
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
          <p className="text-xs text-slate-500">{title}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-xs">
        <div>
          <dt className="text-slate-500">Primary practice</dt>
          <dd className="font-medium text-slate-900">{practice}</dd>
        </div>

        <div>
          <dt className="text-slate-500">Courts / forums</dt>
          <dd className="font-medium text-slate-900">{chambers}</dd>
        </div>

        <div>
          <dt className="text-slate-500">Matters led</dt>
          <dd className="font-medium text-slate-900">
            {mattersLed?.toLocaleString?.() ?? mattersLed}+ matters
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between text-[11px] text-amber-700">
        <span>★★★★★</span>
        <span className="text-slate-400">Client-rated excellence</span>
      </div>
    </article>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <div className="flex items-center gap-4">
      <div className="h-14 w-14 rounded-full bg-slate-200" />
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-3 w-32 rounded bg-slate-100" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-3 w-full rounded bg-slate-100" />
      <div className="h-3 w-3/4 rounded bg-slate-100" />
      <div className="h-3 w-2/3 rounded bg-slate-100" />
    </div>
  </div>
);

export default FeaturedPartners;
