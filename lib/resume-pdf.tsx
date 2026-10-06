import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type {
  GeneratedResumeContent,
  ResumeGeneratorInput,
} from "@/agent/resume-generator";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
    lineHeight: 1.4,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  currentTitle: {
    fontSize: 12,
    color: "#374151",
    marginTop: 2,
  },
  contact: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 6,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  summary: {
    marginTop: 4,
  },
  role: {
    marginTop: 8,
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  roleTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  roleDates: {
    fontSize: 9,
    color: "#6b7280",
  },
  roleCompany: {
    fontSize: 10,
    color: "#374151",
    marginTop: 1,
  },
  bullet: {
    fontSize: 9.5,
    color: "#374151",
    marginTop: 2,
    lineHeight: 1.4,
  },
  educationRow: {
    marginTop: 4,
  },
  educationLine: {
    fontSize: 10,
    color: "#374151",
  },
  skills: {
    marginTop: 4,
    fontSize: 10,
    color: "#374151",
  },
});

function formatRoleDates(role: {
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
}): string {
  if (!role.startDate) {
    return role.currentlyWorking || !role.endDate ? "" : role.endDate;
  }
  const end = role.currentlyWorking || !role.endDate ? "Present" : role.endDate;
  return `${role.startDate} — ${end}`;
}

function contactLine(profile: ResumeGeneratorInput): string {
  const parts = [
    profile.location,
    profile.email,
    profile.phone,
    profile.linkedin_url,
  ].filter(Boolean);
  return parts.join("   ·   ");
}

function educationLine(profile: ResumeGeneratorInput): string {
  const { degree, fieldOfStudy, institution, graduationYear } = profile.education;
  const parts: string[] = [];
  const credential = [degree, fieldOfStudy].filter(Boolean).join(", ");
  if (credential) parts.push(credential);
  if (institution) parts.push(institution);
  if (graduationYear) parts.push(graduationYear);
  return parts.join(" — ");
}

export function ResumeDocument({
  profile,
  content,
}: {
  profile: ResumeGeneratorInput;
  content: GeneratedResumeContent;
}) {
  const contact = contactLine(profile);
  const education = educationLine(profile);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{profile.full_name}</Text>
        {profile.current_title && (
          <Text style={styles.currentTitle}>{profile.current_title}</Text>
        )}
        {contact && <Text style={styles.contact}>{contact}</Text>}

        {content.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SUMMARY</Text>
            <Text style={styles.summary}>{content.summary}</Text>
          </View>
        )}

        {content.roles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCE</Text>
            {content.roles.map((role, index) => {
              const dates = formatRoleDates(role);
              return (
                <View key={`${role.company}-${role.title}-${index}`} style={styles.role}>
                  <View style={styles.roleHeader}>
                    <Text style={styles.roleTitle}>
                      {[role.title, role.company].filter(Boolean).join(", ")}
                    </Text>
                    {dates && <Text style={styles.roleDates}>{dates}</Text>}
                  </View>
                  {role.bullets.map((bullet, bulletIndex) => (
                    <Text key={bulletIndex} style={styles.bullet}>
                      {"\u2022"} {bullet}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {education && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            <View style={styles.educationRow}>
              <Text style={styles.educationLine}>{education}</Text>
            </View>
          </View>
        )}

        {profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            <Text style={styles.skills}>{profile.skills.join("   ·   ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
