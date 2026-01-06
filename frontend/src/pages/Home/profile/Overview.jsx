import { useOutletContext } from 'react-router';

// Custom Components
import BioSection from './profilesSubSections/BioSection';
import EducationSection from './profilesSubSections/EducationSection';
import ExperienceSection from './profilesSubSections/ExperienceSection';
import ResearchInterestsSection from './profilesSubSections/ResearchInterestsSection';
import SocialLinksSection from './profilesSubSections/SocialLinksSection';

const Overview = () => {
    const { profileData, user, fetchUserProfile } = useOutletContext();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main Content: Bio, Education, Experience */}
            <div className="lg:col-span-2 space-y-5">
                <BioSection profileData={profileData} user={user} fetchUserProfile={fetchUserProfile} />
                <EducationSection profileData={profileData} user={user} fetchUserProfile={fetchUserProfile} />
                <ExperienceSection profileData={profileData} user={user} fetchUserProfile={fetchUserProfile} />
            </div>

            {/* Sidebar: Interests, Social Links */}
            <div className="space-y-5">
                <ResearchInterestsSection profileData={profileData} user={user} fetchUserProfile={fetchUserProfile} />
                <SocialLinksSection profileData={profileData} user={user} fetchUserProfile={fetchUserProfile} />
            </div>
        </div>
    );
};

export default Overview;
