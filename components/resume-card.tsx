interface ResumeCardProps {
  imageUrl: string;
  name?: string;
  targetRole?: string;
  experienceLevel?: string;
  extractedInfo?: {
    skills: string[];
    experience: string[];
    education: string[];
  };
}

export function ResumeCard({
  imageUrl,
  name,
  targetRole,
  experienceLevel,
  extractedInfo,
}: ResumeCardProps) {
  return (
    <div className="bg-pure-white rounded-3xl shadow-card overflow-hidden">
      <div className="relative aspect-[8.5/11] w-full overflow-hidden bg-fog">
        <img
          src={imageUrl}
          alt="Resume preview"
          className="h-full w-full object-contain"
        />
      </div>

      {(name || targetRole) && (
        <div className="p-6">
          {name && (
            <h3 className="text-heading-sm font-medium text-ink">{name}</h3>
          )}
          {targetRole && (
            <p className="text-body text-ash mt-1">{targetRole}</p>
          )}
          {experienceLevel && (
            <span className="mt-3 inline-block rounded-full bg-sky-wash px-3 py-1 text-caption text-ink">
              {experienceLevel}
            </span>
          )}
        </div>
      )}

      {extractedInfo && (
        <div className="border-t border-fog px-6 py-5">
          {extractedInfo.skills.length > 0 && (
            <div className="mb-4">
              <h4 className="text-caption font-medium text-graphite uppercase tracking-wider mb-2">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {extractedInfo.skills.slice(0, 8).map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-fog px-3 py-1 text-caption text-ash"
                  >
                    {skill}
                  </span>
                ))}
                {extractedInfo.skills.length > 8 && (
                  <span className="rounded-full bg-fog px-3 py-1 text-caption text-graphite">
                    +{extractedInfo.skills.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {extractedInfo.experience.length > 0 && (
            <div className="mb-4">
              <h4 className="text-caption font-medium text-graphite uppercase tracking-wider mb-2">
                Experience
              </h4>
              {extractedInfo.experience.slice(0, 3).map((exp, i) => (
                <p key={i} className="text-caption text-ash">
                  {exp}
                </p>
              ))}
            </div>
          )}

          {extractedInfo.education.length > 0 && (
            <div>
              <h4 className="text-caption font-medium text-graphite uppercase tracking-wider mb-2">
                Education
              </h4>
              {extractedInfo.education.map((edu, i) => (
                <p key={i} className="text-caption text-ash">
                  {edu}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
