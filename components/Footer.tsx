import React from 'react';

const FooterColumn: React.FC<{ title: string; links: string[] }> = ({ title, links }) => (
  <div className="flex flex-col gap-3">
    <h4 className="font-serif font-bold text-ink text-base mb-2">{title}</h4>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link}>
          <a href="#" className="text-sm text-subtle hover:text-ink transition-colors">{link}</a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-paper border-t border-border pt-16 pb-12 px-6 md:px-12 mt-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 border border-ink flex items-center justify-center rounded-sm">
                <span className="font-serif font-bold text-xs">1</span>
            </div>
            <h5 className="font-serif font-bold text-lg text-ink">ONE1 INTELLECT</h5>
          </div>
          <p className="text-sm text-subtle leading-relaxed pr-8">
            The front door to human understanding. verified, versioned, and strictly neutral.
          </p>
        </div>

        <FooterColumn 
          title="Platform" 
          links={["Vision", "Methodology", "ONE1 VERIFY", "Ethics & Neutrality"]} 
        />
        <FooterColumn 
          title="Knowledge" 
          links={["Knowledge Base", "Language & Meaning", "Insight Articles", "Life Guides"]} 
        />
        <FooterColumn 
          title="Legal" 
          links={["Terms of Service", "Privacy Policy", "Data Licensing", "Transparency Report"]} 
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border text-xs text-subtle/50 uppercase tracking-wider">
        <p>© 2024 ONE1 Intellect Inc.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <span>Non-Commercial</span>
          <span>Academic Standard</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;