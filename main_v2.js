/* 
================================================================
THE GENIUS AGENCY - CORE JAVASCRIPT (CLEAN SWEEP REWRITE)
================================================================
*/

// 1. GLOBAL STATE & HELPERS
const path = window.location.pathname.toLowerCase();
const isHome = path === '/' || path.endsWith('/') || path.includes('index.html') || path === '';
const isTeamPage = path.includes('team.html') || path.endsWith('/team') || path === '/team';
const isPortfolioPage = path.includes('portfolio.html') || path.endsWith('/portfolio') || path === '/portfolio';

// Safe Supabase check to prevent "ReferenceError" crashes
const getSupabase = () => {
    try {
        // Use exposed client from nav-auth.js or fall back to global supabase
        if (typeof window !== 'undefined' && window.supabaseClient) {
            return window.supabaseClient;
        }
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            return supabase.createClient('https://tjxyxasorunhrtvstwpa.supabase.co', 'sb_publishable_d3YtyYkTynAVyTEVIN19dQ_-4wZkGHV');
        }
        return null;
    } catch (e) {
        console.error('Supabase init error:', e);
        return null;
    }
};

// Flag helper – converts ISO country code to flag emoji via codepoints
const flag = (c) => String.fromCodePoint(...[...c.toUpperCase()].map(l => 0x1F1E6 - 65 + l.charCodeAt(0)));

// Helper to render star emojis based on a numeric rating
const renderStars = (rating) => {
    const r = parseFloat(rating) || 5.0;
    const fullStars = Math.floor(r);
    const halfStar = (r % 1) >= 0.5 ? '★' : ''; // simplified for emojis, or use different symbols
    return '★'.repeat(fullStars); 
};

// 2. DATA
let experts = [
    {
        id: "exp-1", categories: ["Graphic Design", "Video Editing"], name: "Marvel M.", role: "Graphic Design & Video Editing", desc: "Hi, I’m Marvel M., a creative visual designer passionate about turning ideas into visually engaging and professional designs.", image: "Freelancer Photos/Marvelous M..png", link: "https://www.upwork.com/freelancers/~01c67ce2d6147d89e4?mp_source=share", platform: "upwork", rating: "5.0", reviews: "28", stars: "⭐⭐⭐⭐⭐",
        projects: "26", yearsExp: "4",
        bio: "Hi, I’m Marvel M., a creative visual designer passionate about turning ideas into visually engaging and professional designs. I specialize in pitch deck design, presentation design, 3D animation, branding, corporate identity, video editing, motion graphics, and social media visuals. I help businesses, startups, and professionals communicate their ideas clearly through stunning visual content that captures attention, improves presentation quality, and leaves a lasting impression.",
        services_desc: "Elite visual design services specializing in investor pitch decks, corporate presentations, and 3D motion graphics. I combine storytelling with premium aesthetics to help your brand stand out in high-stakes environments.",
        services: ["Pitch Deck Design", "Presentation Design", "3D Animation", "Video Editing", "Corporate Branding", "Motion Graphics Design", "Social Media Graphics", "Business Presentation Templates", "Promotional Video Creation", "Visual Storytelling Design"],
        location: "Nigeria", responseTime: "Within 4 mins", languages: "English", availability: "Available for new projects",
        skills: ["Pitch Decks", "3D Animation", "Video Editing"],
        portfolio: ["portfolios/PITCH DECK AND PRESENTATION/Business Case v1.pdf", "portfolios/PITCH DECK AND PRESENTATION/Dequity Capital v1.pdf", "portfolios/PITCH DECK AND PRESENTATION/E Profile Flex Logistics_.pdf", "portfolios/PITCH DECK AND PRESENTATION/Media Outpost v2.pdf"],
        testimonials: [
            { name: "David L.", flag: flag("NG"), time: "2 weeks ago", text: "Marvel delivered an incredible pitch deck that secured our funding round. Top tier work!", rating: "5.0" },
            { name: "Sarah K.", flag: flag("NG"), time: "1 month ago", text: "Extremely fast execution and perfect attention to brand detail. Highly recommended.", rating: "5.0" },
            { name: "Tom B.", flag: flag("NG"), time: "2 months ago", text: "Outstanding quality and professional approach. The design exceeded all expectations.", rating: "5.0" },
            { name: "Grace A.", flag: flag("NG"), time: "3 months ago", text: "The presentation design was beyond what I expected. Truly impressive work and very fast delivery.", rating: "5.0" },
            { name: "James O.", flag: flag("NG"), time: "4 months ago", text: "Very creative and talented. My pitch deck looked like it was made by a top agency. Will hire again.", rating: "5.0" },
            { name: "Priya M.", flag: flag("NG"), time: "5 months ago", text: "Fantastic attention to detail and brand consistency. The slides were polished and professional.", rating: "5.0" }
        ]
    },
    {
        id: "exp-2", categories: ["Digital Marketing"], name: "Cecilia A.", role: "Digital Marketing Specialist", desc: "Hello, I’m Cecilia A., a creative website designer and digital marketing specialist focused on building attractive, responsive, and high-converting websites.", image: "Freelancer Photos/Cecilia Abisola.png", link: "https://www.fiverr.com/abisola815", platform: "fiverr", rating: "4.8", reviews: "24", stars: "⭐⭐⭐⭐⭐",
        projects: "28", yearsExp: "4",
        bio: "Hello, I’m Cecilia A., a creative website designer and digital marketing specialist focused on building attractive, responsive, and high-converting websites for businesses and entrepreneurs. I specialize in Shopify development, WordPress websites, Framer design, landing pages, website redesign, eCommerce setup, branding, and online marketing strategies. My goal is to create modern digital experiences that help businesses attract customers, increase engagement, and grow their online presence successfully.",
        services_desc: "Bespoke website design and eCommerce marketing solutions. I create high-converting Shopify and WordPress stores, optimized for speed, SEO, and maximum sales growth.",
        services: ["Shopify Store Development", "WordPress Website Design", "Framer Website Design", "eCommerce Website Setup", "Landing Page Design", "Website Redesign", "Website Speed Optimization", "Brand Identity Design", "Digital Marketing Support", "Responsive Website Development"],
        location: "Nigeria", responseTime: "Within 3 mins", languages: "English", availability: "Available for new projects",
        skills: ["Shopify", "WordPress", "Framer"],
        portfolio: ["portfolios/SHOPIFY DESIGN/screencapture-godfullness-2025-07-23-18_43_23.png", "portfolios/SHOPIFY DESIGN/screencapture-isolabellakids-2025-07-23-18_40_13.png", "portfolios/SHOPIFY SALES/screen-capture (4).webm", "portfolios/SHOPIFY SALES/screen-capture (5).webm", "portfolios/SHOPIFY DESIGN/screencapture-myletitshine-net-2025-07-23-18_40_59.png"],
        testimonials: [
            { name: "Golddenplus", flag: flag("GB"), time: "Just now", text: "This is amazing and top notch. I would highly recommend this seller because of her problem solving skills.", rating: "5.0" },
            { name: "pearl_23e", flag: flag("US"), time: "Just now", text: "She is amazing and professional. One thing special about her is calmness and very polite. Thank you for your service!", rating: "5.0" },
            { name: "John D.", flag: flag("NG"), time: "3 weeks ago", text: "Cecilia did an amazing job! The website looks stunning and performs perfectly. Highly recommended!", rating: "5.0" },
            { name: "Elena R.", flag: flag("NG"), time: "1 month ago", text: "Great communication, fast delivery and excellent quality. Will work with her again!", rating: "5.0" },
            { name: "Mark S.", flag: flag("NG"), time: "2 months ago", text: "She transformed our Shopify store completely. Sales improved immediately after launch.", rating: "4.9" },
            { name: "Temi A.", flag: flag("NG"), time: "3 months ago", text: "Super professional and creative. My Webflow site looked premium and loaded super fast.", rating: "5.0" },
            { name: "Rachel K.", flag: flag("NG"), time: "4 months ago", text: "Cecilia is an absolute gem. She built my WordPress site from scratch and it looks flawless.", rating: "5.0" },
            { name: "Abdul H.", flag: flag("NG"), time: "5 months ago", text: "Delivered exactly what was requested. Clean design, fast turnaround, great communication throughout.", rating: "4.9" }
        ]
    },
    {
        id: "exp-3", categories: ["Programming & Tech"], name: "Timil O.", role: "Software Engineering", desc: "Hello, I’m Timil O., a skilled software engineer experienced in developing high-performance web and mobile applications.", image: "Freelancer Photos/Timil O.png", link: "https://www.fiverr.com/otuntimilhehin", platform: "fiverr", rating: "5.0", reviews: "29", stars: "⭐⭐⭐⭐⭐",
        projects: "22", yearsExp: "5",
        bio: "Hello, I’m Timil O., a skilled software engineer experienced in developing high-performance web and mobile applications for businesses and individuals. My expertise includes web application development, app development, backend systems, frontend design, API integration, database management, troubleshooting, and bug fixing. I focus on building secure, scalable, and user-friendly solutions that improve efficiency, solve technical challenges, and provide smooth user experiences across different platforms.",
        services_desc: "Senior-level software engineering for web and mobile platforms. Expert in MERN stack development, Python backend systems, and complex API architectures designed for enterprise-level performance.",
        services: ["Web Application Development", "Full-Stack Development", "Backend Development", "Frontend Development", "API Integration", "Database Management", "Bug Fixing & Debugging", "Software Maintenance", "Custom Software Solutions", "Technical Support & Optimization"],
        location: "Nigeria", responseTime: "Within 5 mins", languages: "English", availability: "Available for new projects",
        skills: ["Web Applications", "Web & App Development", "Bug Fixing"],
        portfolio: ["portfolios/WORDPRESS WEDSITE/screencapture-marketing-mavericks-org-2025-07-24-18_27_06.png", "portfolios/WORDPRESS WEDSITE/screencapture-paxtans-2025-07-24-18_25_13.png", "portfolios/WORDPRESS WEDSITE/screencapture-damashiidigital-2025-07-24-18_26_36.png", "portfolios/WORDPRESS WEDSITE/screencapture-goldenrod-dog-322237-hostingersite-2025-07-24-18_27_50.png"],
        testimonials: [
            { name: "Michael B.", flag: flag("NG"), time: "2 weeks ago", text: "Timil completely restructured our database routing. The app is 10x faster now.", rating: "5.0" },
            { name: "Anna C.", flag: flag("NG"), time: "1 month ago", text: "Flawless API integration. Very professional and communicative throughout.", rating: "5.0" },
            { name: "Paul W.", flag: flag("NG"), time: "2 months ago", text: "Delivered a complex backend system on time and perfectly documented. Exceptional.", rating: "5.0" },
            { name: "Kofi A.", flag: flag("NG"), time: "3 months ago", text: "Built our entire Node.js backend from scratch. Clean architecture and zero bugs on delivery.", rating: "5.0" },
            { name: "Lena P.", flag: flag("NG"), time: "4 months ago", text: "Incredible technical skill. He solved our AWS configuration issues within hours. Very reliable.", rating: "5.0" },
            { name: "David N.", flag: flag("NG"), time: "5 months ago", text: "Timil is the definition of a senior engineer. Thoughtful, precise and highly efficient.", rating: "5.0" }
        ]
    },
    {
        id: "exp-4", categories: ["Graphic Design", "Programming & Tech"], name: "T. Dre", role: "Mobile App Development & Design", desc: "Hi, I’m T. Dre, a mobile app developer dedicated to creating innovative, functional, and user-friendly mobile applications.", image: "Freelancer Photos/T. Dre .png", link: "https://www.fiverr.com/damilare_toz", platform: "fiverr", rating: "4.9", reviews: "22", stars: "⭐⭐⭐⭐⭐",
        projects: "20", yearsExp: "3",
        bio: "Hi, I’m T. Dre, a mobile app developer dedicated to creating innovative, functional, and user-friendly mobile applications for Android and iOS devices. I specialize in Android app development, iOS app development, app UI/UX design, app testing, app maintenance, and mobile performance optimization. My goal is to transform ideas into modern mobile applications that are visually appealing, easy to use, and capable of delivering excellent user experiences.",
        services_desc: "Native and cross-platform mobile app development for iOS and Android. I provide complete development cycles from wireframing and prototyping to final deployment and maintenance.",
        services: ["Android App Development", "iOS App Development", "Mobile UI/UX Design", "Cross-Platform App Development", "App Testing & Debugging", "App Maintenance & Updates", "Mobile App Optimization", "App Prototype Design", "App Store Deployment", "Custom Mobile Solutions"],
        location: "Nigeria", responseTime: "Within 3 mins", languages: "English", availability: "Available for new projects",
        skills: ["Android App", "IOS App", "App Design"],
        portfolio: ["portfolios/WORDPRESS WEDSITE/screencapture-marketing-mavericks-org-2025-07-24-18_27_06.png", "portfolios/SHOPIFY DESIGN/screencapture-peggyskiddycorral-2025-07-23-18_37_52.png", "portfolios/SHOPIFY DESIGN/screencapture-planetgreenhouse-2025-07-23-18_37_28.png", "portfolios/WORDPRESS WEDSITE/screencapture-damashiidigital-2025-07-24-18_26_36.png"],
        testimonials: [
            { name: "James W.", flag: flag("NG"), time: "1 week ago", text: "Our iOS app launched flawlessly. T. Dre understood the vision immediately.", rating: "5.0" },
            { name: "Sophia T.", flag: flag("NG"), time: "3 weeks ago", text: "The UI design for our MVP was stunning. Excellent development partner.", rating: "4.8" },
            { name: "Remi A.", flag: flag("NG"), time: "2 months ago", text: "Clean, well-structured code and great attention to UX detail. Would hire again.", rating: "5.0" },
            { name: "Yuki T.", flag: flag("NG"), time: "3 months ago", text: "Our Flutter app works perfectly on both iOS and Android. T. Dre is extremely skilled and reliable.", rating: "5.0" },
            { name: "Ben O.", flag: flag("NG"), time: "4 months ago", text: "He delivered a complete React Native app with Firebase integration. Exceptional quality and speed.", rating: "5.0" },
            { name: "Zara M.", flag: flag("NG"), time: "5 months ago", text: "Very talented mobile developer. My app looked exactly like the Figma designs. Great job!", rating: "4.9" }
        ]
    },
    {
        id: "exp-5", categories: ["Digital Marketing"], name: "Beatrice H.", role: "eCommerce Specialist", desc: "Hello, I’m Beatrice H., an eCommerce and marketplace specialist helping brands and online businesses increase visibility and grow sales.", image: "Freelancer Photos/Beatrice O..png", link: "https://www.fiverr.com/happiness", platform: "fiverr", rating: "4.8", reviews: "26", stars: "⭐⭐⭐⭐⭐",
        projects: "27", yearsExp: "4",
        bio: "Hello, I’m Beatrice H., an eCommerce and marketplace specialist helping brands and online businesses increase visibility, attract customers, and grow sales across major online marketplaces. I specialize in Etsy SEO, Etsy product design, Etsy promotion, eBay listings, eCommerce store management, Amazon KDP ads, product optimization, and marketplace marketing strategies. I help businesses create professional product listings, improve search rankings, boost conversions, and build successful online stores that stand out in competitive marketplaces.",
        services_desc: "Advanced marketplace growth strategies for Etsy and eBay. My services include deep listing SEO, shop management, and product design optimization to drive consistent organic traffic and sales.",
        services: ["Etsy SEO Optimization", "Etsy Product Design", "Etsy Store Promotion", "eBay Product Listings", "eCommerce Store Management", "Amazon KDP Advertising", "Product Listing Optimization", "Marketplace Keyword Research", "Online Store Branding", "Sales Growth Strategy for Marketplaces"],
        location: "Nigeria", responseTime: "Within 4 mins", languages: "English", availability: "Available for new projects",
        skills: ["Etsy & eBay SEO", "eBay & Etsy Listings", "Amazon KDP Ads"],
        portfolio: ["portfolios/SHOPIFY SALES/sale 10.png", "portfolios/SHOPIFY SALES/sales 1.png", "portfolios/SHOPIFY SALES/recording.mkv", "portfolios/SHOPIFY SALES/sales 2.png", "portfolios/SHOPIFY SALES/sales 3.png"],
        testimonials: [
            { name: "Oliver P.", flag: flag("NG"), time: "2 weeks ago", text: "My Etsy store traffic tripled within 2 weeks of Beatrice optimizing my listings.", rating: "5.0" },
            { name: "Emma H.", flag: flag("NG"), time: "1 month ago", text: "Detailed, accurate, and extremely effective marketplace strategy.", rating: "4.9" },
            { name: "Karen L.", flag: flag("NG"), time: "2 months ago", text: "She completely turned around our eBay store performance. Highly recommended!", rating: "4.8" },
            { name: "Tunde F.", flag: flag("NG"), time: "3 months ago", text: "Beatrice optimized my Amazon KDP listings and my book sales doubled. Very knowledgeable expert.", rating: "5.0" },
            { name: "Marie C.", flag: flag("NG"), time: "4 months ago", text: "Professional and thorough with her product research. Helped me find three winning products.", rating: "4.9" },
            { name: "Sam R.", flag: flag("NG"), time: "5 months ago", text: "Excellent competitor analysis. My store is now ranking much higher in search. Great work!", rating: "4.8" }
        ]
    },
    {
        id: "exp-6", categories: ["Content"], name: "Bukola A.", role: "Content Writing & Publishing", desc: "Hi, I’m Bukola A., a passionate content writer and publishing expert with experience in creating compelling and professional written content.", image: "Freelancer Photos/Bukola A..png", link: "https://www.upwork.com/freelancers/~01c7f84eca51d25c4e?mp_source=share", fiverrLink: "https://www.fiverr.com/abioye_bukky", platform: "fiverr,upwork", rating: "5.0", reviews: "21", stars: "⭐⭐⭐⭐⭐",
        projects: "23", yearsExp: "3",
        bio: "Hi, I’m Bukola A., a passionate content writer and publishing expert with experience in creating compelling, engaging, and professional written content. I specialize in article writing, eBook writing, SEO content creation, proofreading, editing, copywriting, formatting, and publishing support. Whether you need blog posts, business content, or complete eBooks ready for publishing, I deliver high-quality work that communicates clearly, attracts readers, and strengthens your brand identity.",
        services_desc: "Professional content strategy and publication services. I specialize in SEO-driven article writing, eBook formatting, and full-scale Amazon KDP publishing support to help brands establish digital authority.",
        services: ["Article Writing", "eBook Writing", "Blog Content Creation", "SEO Content Writing", "Copywriting Services", "Proofreading & Editing", "eBook Formatting", "Ghostwriting", "Website Content Writing", "Publishing Assistance"],
        location: "Nigeria", responseTime: "Within 5 mins", languages: "English", availability: "Available for new projects",
        skills: ["Article Writing", "eBook Writing", "Formatting & Publishing"],
        portfolio: ["portfolios/DESIGNED AND WRITTEN EBOOKS/12 recipes Whipped Cream Desserts.pdf", "portfolios/DESIGNED AND WRITTEN EBOOKS/25 Yolo Diet Recipes.pdf", "portfolios/DESIGNED AND WRITTEN EBOOKS/30 canning recipes.pdf", "portfolios/DESIGNED AND WRITTEN EBOOKS/50 Keto Recipes (5 Ingredients) pink.pdf", "portfolios/DESIGNED AND WRITTEN EBOOKS/Meal Plan Makeover.pdf", "portfolios/DESIGNED AND WRITTEN EBOOKS/cookbook cover.pdf"],
        testimonials: [
            { name: "Juryosamab", flag: flag("SA"), time: "Just now", text: "I had a great experience working with him. He was very cooperative, responsive, and delivered the work on time. The quality of the research was solid, and he was open to feedback and revisions whenever needed. Overall, a reliable and professional person to work with. Highly recommended.", rating: "5.0" },
            { name: "Pearl_23e", flag: flag("US"), time: "Just now", text: "Very amazing service render by Becky, Thank for the effort. God bless,", rating: "5.0" },
            { name: "Chris M.", flag: flag("NG"), time: "1 week ago", text: "Bukola formatted and published my eBook flawlessly. She is a true professional.", rating: "5.0" },
            { name: "Diana L.", flag: flag("NG"), time: "3 weeks ago", text: "The blog articles are engaging and rank incredibly well on Google.", rating: "5.0" },
            { name: "Fiona G.", flag: flag("NG"), time: "2 months ago", text: "Incredible writing quality. She delivered my ghostwriting project ahead of schedule.", rating: "5.0" },
            { name: "Leo B.", flag: flag("NG"), time: "3 months ago", text: "Bukola wrote a full 60-page eBook for me and it reads brilliantly. Very impressed.", rating: "5.0" },
            { name: "Aisha K.", flag: flag("NG"), time: "4 months ago", text: "Excellent SEO writing skills. My blog traffic increased significantly after her articles.", rating: "5.0" },
            { name: "Henry P.", flag: flag("NG"), time: "5 months ago", text: "She formatted and uploaded my KDP book perfectly. Professional and reliable every step of the way.", rating: "5.0" }
        ]
    },
    {
        id: "exp-7", categories: ["Digital Marketing", "Programming & Tech"], name: "Jeremiah A.", role: "Digital Marketing & Software Development", desc: "Hello, I’m Jeremiah A., a software developer and digital marketing specialist dedicated to helping businesses grow their online presence.", image: "Freelancer Photos/Jeremiah A.jpg", link: "https://www.upwork.com/freelancers/~01681e8c5abb66f8c8?mp_source=share", platform: "upwork", rating: "5.0", reviews: "30", stars: "⭐⭐⭐⭐⭐",
        projects: "28", yearsExp: "5",
        bio: "Hello, I’m Jeremiah A., a software developer and digital marketing specialist dedicated to helping businesses grow their online presence through technology and smart marketing strategies. I specialize in web and app development, Android and iOS applications, digital marketing campaigns, SEO optimization, and online branding. I combine technical innovation with creative marketing approaches to build solutions that increase visibility, improve customer engagement, and drive business growth.",
        services_desc: "Comprehensive full-stack development services focusing on high-performance web applications and gorgeous UI/UX. I deliver scalable frontend and backend solutions that handle complex data with ease.",
        services: ["Website Development", "Mobile App Development", "Android App Development", "iOS App Development", "Digital Marketing Campaigns", "SEO Optimization", "Social Media Marketing", "Business Branding Solutions", "Landing Page Design", "Online Advertising Management"],
        location: "Nigeria", responseTime: "Within 3 mins", languages: "English", availability: "Available for new projects",
        skills: ["Digital Marketing", "Web & APP Development", "IOS & Android App"],
        portfolio: ["portfolios/WORDPRESS WEDSITE/screencapture-playasurparadise-2025-07-24-18_26_51.png", "portfolios/WORDPRESS WEDSITE/screencapture-sprixo-scentara-2025-07-24-18_26_23.png", "portfolios/SHOPIFY SALES/recording (1).mkv", "portfolios/SHOPIFY SALES/recording (2).mkv", "portfolios/WORDPRESS WEDSITE/screencapture-the-european-way-eu-2025-07-24-18_28_08.png", "portfolios/WORDPRESS WEDSITE/screencapture-defaren-org-2025-07-24-18_27_35.png"],
        testimonials: [
            { name: "Richard V.", flag: flag("NG"), time: "1 week ago", text: "Jeremiah built our entire SaaS dashboard from scratch. Phenomenal talent.", rating: "5.0" },
            { name: "Kevin T.", flag: flag("NG"), time: "3 weeks ago", text: "Incredibly fast bug resolution and highly scalable clean code.", rating: "5.0" },
            { name: "Amara N.", flag: flag("NG"), time: "1 month ago", text: "Super professional, quick turnaround, and the codebase is very clean. Would absolutely hire again.", rating: "5.0" },
            { name: "Daniel S.", flag: flag("NG"), time: "2 months ago", text: "Excellent communication and strong engineering judgment. He shipped a complex integration without issues.", rating: "5.0" },
            { name: "Lucy P.", flag: flag("NG"), time: "3 months ago", text: "He improved our performance dramatically and fixed bugs we couldn't track down. Reliable and fast.", rating: "5.0" },
            { name: "Omar A.", flag: flag("NG"), time: "4 months ago", text: "Delivered exactly what we needed and suggested better approaches along the way. Great partner.", rating: "5.0" }
        ]
    }
];

async function loadDynamicExperts() {
    const sb = getSupabase();
    if (!sb) return;

    try {
        const { data, error } = await sb.from('experts').select('*').eq('is_active', true);
        if (error) throw error;

        if (data && data.length > 0) {
            // Map DB fields to the structure used in main.js
            const dbExperts = data.map(e => ({
                id: e.id,
                name: e.name,
                role: e.role,
                desc: e.bio ? e.bio.substring(0, 100) + '...' : '',
                services_desc: e.services_desc || '',
                services: e.services_list || [],
                // Ensure image path is correct (prefix with Freelancer Photos/ if not absolute)
                image: e.image_url 
                    ? (e.image_url.startsWith('http') || e.image_url.startsWith('Freelancer') ? e.image_url : `Freelancer Photos/${e.image_url}`) 
                    : 'Freelancer Photos/default.png',
                link: e.upwork_url || e.fiverr_url || '',
                platform: (e.upwork_url ? 'upwork' : '') + (e.fiverr_url ? ',fiverr' : ''),
                rating: String(e.rating || '5.0'),
                reviews: String(e.total_reviews || '0'),
                projects: String(e.total_projects || '0') + '+',
                yearsExp: '3+',
                bio: e.bio || '',
                location: e.location || 'Global',
                responseTime: e.response_time || 'Within 2 hours',
                languages: 'English',
                availability: e.availability || 'Available',
                categories: e.categories || (e.category ? [e.category] : ["Expert"]),
                skills: e.skills_list || e.skills || [],
                portfolio: [], 
                testimonials: []
            }));

            // Merge: Keep hardcoded ones but prefer DB for data updates. Check by name to prevent duplicates.
            const hardcodedNames = new Set(experts.map(ex => ex.name.toLowerCase()));
            
            // For existing experts, update their properties from DB
            experts = experts.map(ex => {
                const dbMatch = dbExperts.find(dbEx => dbEx.name.toLowerCase() === ex.name.toLowerCase());
                if (dbMatch) {
                    // Only overwrite image if the DB one is NOT the default fallback
                    const newImage = (dbMatch.image && !dbMatch.image.includes('default.png')) ? dbMatch.image : ex.image;
                    
                    // For our core 8 experts, we prioritize our hardcoded categories/skills 
                    // unless the DB has something significantly different (not just fallback)
                    const isCoreExpert = ex.id.startsWith('exp-');
                    
                    const hasRealDbCats = dbMatch.categories && dbMatch.categories.length > 0 && !dbMatch.categories.includes('Expert') && !dbMatch.categories.includes('General');
                    const newCategories = (isCoreExpert && !hasRealDbCats) ? ex.categories : (hasRealDbCats ? dbMatch.categories : ex.categories);

                    const hasRealDbSkills = dbMatch.skills && dbMatch.skills.length > 0 && !dbMatch.skills.includes('Expert') && !dbMatch.skills.includes('General');
                    const newSkills = (isCoreExpert && !hasRealDbSkills) ? ex.skills : (hasRealDbSkills ? dbMatch.skills : ex.skills);

                    // Format rating and projects to match requested variation
                    // Logic: Overall rating must be between 4.8 and 5.0
                    let dbRating = parseFloat(dbMatch.rating || ex.rating);
                    
                    // Force specific ratings for Jeremiah as requested
                    if (ex.name.toLowerCase().includes('jeremiah')) {
                        dbRating = 5.0;
                    } else if (dbRating > 4.79) {
                        const variations = ["5.0", "4.9", "4.8", "5.0", "4.9", "4.8"];
                        const seed = dbMatch.name.length + (parseInt(dbMatch.reviews || 0, 10) % 7);
                        dbRating = parseFloat(variations[seed % variations.length]);
                    }
                    const formattedRating = (dbRating >= 4.8 && dbRating <= 5.0) ? dbRating.toFixed(1) : ex.rating;
                    
                    const dbProjects = String(dbMatch.projects || ex.projects).replace(/\D/g, '');
                    const formattedProjects = (dbProjects >= 15 && dbProjects <= 30) ? dbProjects : ex.projects;

                    const dbReviews = parseInt(dbMatch.reviews || ex.reviews, 10);
                    const formattedReviews = (dbReviews >= 10) ? dbReviews : (parseInt(ex.reviews, 10) || 20);

                    // For our core 8 experts, we prioritize our hardcoded bio/services_desc
                    // unless the DB has something substantial (not just empty or default)
                    const hasRealDbBio = dbMatch.bio && dbMatch.bio.length > 30;
                    const finalBio = (isCoreExpert && !hasRealDbBio) ? ex.bio : (dbMatch.bio || ex.bio);
                    
                    const hasRealDbSvcDesc = dbMatch.services_desc && dbMatch.services_desc.length > 30;
                    const finalSvcDesc = (isCoreExpert && !hasRealDbSvcDesc) ? ex.services_desc : (dbMatch.services_desc || ex.services_desc);

                    const hasRealDbServices = dbMatch.services && dbMatch.services.length > 0;
                    const finalServices = (isCoreExpert && !hasRealDbServices) ? ex.services : (dbMatch.services || ex.services);

                    const hasRealDbLoc = dbMatch.location && dbMatch.location !== 'Global' && dbMatch.location !== '';
                    const finalLoc = (isCoreExpert && !hasRealDbLoc) ? ex.location : (dbMatch.location || ex.location);

                    const finalPlatform = isCoreExpert ? ex.platform : (dbMatch.platform || ex.platform);
                    const finalLink = isCoreExpert ? ex.link : (dbMatch.link || ex.link);
                    const finalFiverrLink = isCoreExpert ? ex.fiverrLink : (dbMatch.fiverrLink || ex.fiverrLink);
                    
                    // CRITICAL: Preserve hardcoded testimonials if DB ones are empty
                    const finalTestimonials = (dbMatch.testimonials && dbMatch.testimonials.length > 0) ? dbMatch.testimonials : ex.testimonials;

                    return { 
                        ...ex, 
                        ...dbMatch, 
                        image: newImage, 
                        categories: isCoreExpert ? ex.categories : newCategories,
                        skills: isCoreExpert ? ex.skills : newSkills,
                        rating: formattedRating,
                        projects: formattedProjects,
                        reviews: formattedReviews,
                        bio: finalBio,
                        services_desc: finalSvcDesc,
                        services: finalServices,
                        location: finalLoc,
                        platform: finalPlatform,
                        link: finalLink,
                        fiverrLink: finalFiverrLink,
                        testimonials: finalTestimonials,
                        id: ex.id 
                    };
                }
                return ex;
            });

            // Add any truly new experts that weren't in hardcoded list
            const brandNewExperts = dbExperts.filter(dbEx => !hardcodedNames.has(dbEx.name.toLowerCase()));
            experts = [...experts, ...brandNewExperts];

            // Re-sort
            // Re-sort to requested order: Jeremiah, Bukola, Cecilia, etc.
            const order = ["exp-7", "exp-6", "exp-2", "exp-1", "exp-3", "exp-4", "exp-5"];
            experts.sort((a, b) => {
                const ai = order.indexOf(a.id);
                const bi = order.indexOf(b.id);
                if (ai === -1 && bi === -1) return 0;
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
            });

            // Re-render components that use experts
            if (typeof initExpertsSwiper === 'function') initExpertsSwiper();
            if (typeof initExpertsDirectory === 'function') initExpertsDirectory();
            if (typeof initReveal === 'function') initReveal();
        }
    } catch (err) {
        console.warn('Could not load dynamic experts:', err);
    }
}

// Sort experts by desired sequence: Jeremiah, Bukola, Cecilia, etc.
const desiredOrder = ["exp-7", "exp-6", "exp-2", "exp-1", "exp-3", "exp-4", "exp-5"];
experts.sort((a, b) => desiredOrder.indexOf(a.id) - desiredOrder.indexOf(b.id));

const portfolioItems = [
    { title: "Q1 Sales Benchmark", category: "E-Commerce Growth", video: "portfolios/SHOPIFY SALES/screen-capture (4).webm" },
    { title: "Q2 Rapid Scaling", category: "Shopify Success Proof", video: "portfolios/SHOPIFY SALES/screen-capture (5).webm" },
    { title: "Q4 High-Yield Spike", category: "Revenue Analytics", video: "portfolios/SHOPIFY SALES/screen-capture (6).webm" },
    { title: "Store Management Results", category: "eCommerce Operations", video: "portfolios/SHOPIFY SALES/recording.mkv" },
    { title: "Luxury Shopify Store", category: "E-Commerce", image: "portfolios/SHOPIFY DESIGN/screencapture-godfullness-2025-07-23-18_43_23.png" },
    { title: "KDP Marketing Success", category: "Marketing", image: "portfolios/AMAZON KDP ADS/A Special Life - Bestseller.png" },
    { title: "Premium Real Estate Web", category: "Web Design", image: "portfolios/WORDPRESS WEDSITE/screencapture-paxtans-2025-07-24-18_25_13.png" },
    { title: "Creative Branding", category: "Agency", image: "portfolios/WORDPRESS WEDSITE/screencapture-marketing-mavericks-org-2025-07-24-18_27_06.png" }
];

// 3. CORE LOGIC
// ── REVEAL SYSTEM ───────────────────────────────
let revealObs = null;

const initReveal = () => {
    const items = document.querySelectorAll('.reveal');
    if (items.length === 0) return;

    // Use a robust IntersectionObserver if available
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        if (!revealObs) {
            revealObs = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        // Once revealed, we can stop observing this specific element
                        revealObs.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.05, // Trigger even if only 5% is visible
                rootMargin: '0px 0px -50px 0px' // Trigger slightly before it enters the viewport
            });
        }
        items.forEach(el => {
            if (!el.classList.contains('active')) {
                revealObs.observe(el);
            }
        });
    } else {
        // No observer support? Just show everything
        items.forEach(el => el.classList.add('active'));
    }

    // AGGRESSIVE FALLBACK: Ensure visibility even if observer fails to trigger
    // We use a shorter timeout (600ms) for a better user experience
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.active)').forEach(el => {
            el.classList.add('active');
        });
    }, 600);
};

// Global Safety Net: Force all reveals on window load
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.active)').forEach(el => {
            el.classList.add('active');
        });
    }, 1000);
});

// ── HERO SLIDER ───────────────────────────────
let currentHeroSlide = 0;
let heroInterval = null;

const initHeroSlider = () => {
    const slider = document.getElementById('hero-slider');
    const indicators = document.getElementById('hero-indicators');
    if (!slider || !indicators) return;

    // If these elements use the "reveal" animation on some pages,
    // ensure the hero doesn't stay invisible when JS successfully injects slides.
    slider.classList.add('active');
    indicators.classList.add('active');

    const groups = [];
    // If odd number, duplicate the first expert to fill the last group's right side
    const displayExperts = [...experts];
    if (displayExperts.length % 2 !== 0) {
        displayExperts.push(displayExperts[0]);
    }

    for (let i = 0; i < displayExperts.length; i += 2) {
        groups.push(displayExperts.slice(i, i + 2));
    }

    slider.innerHTML = groups.map((group, idx) => `
        <div class="hero-group ${idx === 0 ? 'active' : ''}" data-index="${idx}">
            ${group.map(exp => `
                <div class="hero-expert-card" onclick="openExpertModal('${exp.id}')">
                    <img src="${exp.image}" alt="${exp.name}">
                    <div class="card-overlay">
                        <span class="category-tag">${(exp.categories || [exp.category])[0]}</span>
                        <h3>${exp.name}</h3>
                        <p>${exp.role}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');

    indicators.innerHTML = groups.map((_, idx) => `
        <div class="indicator-dash ${idx === 0 ? 'active' : ''}" onclick="goToHeroSlide(${idx})"></div>
    `).join('');

    const showSlide = (index) => {
        const slides = document.querySelectorAll('.hero-group');
        const dashes = document.querySelectorAll('.indicator-dash');
        if (!slides.length) return;
        slides.forEach(s => s.classList.remove('active'));
        dashes.forEach(d => d.classList.remove('active'));
        currentHeroSlide = (index + slides.length) % slides.length;
        slides[currentHeroSlide].classList.add('active');
        dashes[currentHeroSlide].classList.add('active');
    };

    window.goToHeroSlide = (idx) => { showSlide(idx); resetHeroInterval(); };
    document.getElementById('hero-prev')?.addEventListener('click', () => { showSlide(currentHeroSlide - 1); resetHeroInterval(); });
    document.getElementById('hero-next')?.addEventListener('click', () => { showSlide(currentHeroSlide + 1); resetHeroInterval(); });

    const resetHeroInterval = () => {
        clearInterval(heroInterval);
        heroInterval = setInterval(() => showSlide(currentHeroSlide + 1), 6000);
    };
    resetHeroInterval();
};

// ── EXPERT MODAL SYSTEM ───────────────────────────────
let currentExpertId = null;

const openExpertModal = (id) => {
    console.log('Opening expert modal for:', id);
    
    // Force ensure modal exists and is initialized
    ensureExpertModal();
    initExpertModal();
    initExpertTabs();
    
    const allExperts = Array.isArray(experts) ? experts : [];
    const expert = allExperts.find(e => e.id === id);
    if (!expert) return;
    currentExpertId = id;

    const modal = document.getElementById('expert-modal');
    if (!modal) return;

    // Force visibility in case of conflicts
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';

    // Reset scroll
    const scrollArea = modal.querySelector('.modal-scroll-area');
    if (scrollArea) scrollArea.scrollTop = 0;

    // Avatar
    const img = modal.querySelector('.m-img');
    if (img) {
        img.src = expert.image;
        img.style.display = 'block';
    }

    // Name (preserve the verified badge SVG)
    const nameEl = modal.querySelector('.m-name');
    if (nameEl) {
        const badge = nameEl.querySelector('svg');
        nameEl.textContent = expert.name + ' ';
        if (badge) nameEl.appendChild(badge);
    }

    // Role, Bio, Services
    modal.querySelector('.m-role')?.replaceChildren(document.createTextNode(expert.role));
    
    const bioEl = modal.querySelector('.m-bio');
    if (bioEl) {
        const fullBio = expert.bio || '';
        const limit = 160;
        if (fullBio.length > limit) {
            const shortBio = fullBio.substring(0, limit) + '... ';
            bioEl.innerHTML = `<span>${shortBio}</span><button class="read-more-btn" style="background:none;border:none;color:var(--primary-yellow);font-weight:700;cursor:pointer;padding:0;font-size:0.85rem;">Read More</button>`;
            const btn = bioEl.querySelector('.read-more-btn');
            btn.onclick = () => {
                bioEl.innerHTML = fullBio;
                bioEl.style.maxHeight = 'none';
            };
        } else {
            bioEl.textContent = fullBio;
        }
    }

    const servicesOverview = modal.querySelector('#m-services-overview');
    if (servicesOverview) {
        servicesOverview.textContent = expert.services_desc || '';
    }

    const servicesList = modal.querySelector('#m-services-list');
    if (servicesList) {
        servicesList.innerHTML = (expert.services || []).map(s => `
            <div class="sb-service-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary-yellow)" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${s}</span>
            </div>
        `).join('');
    }

    // Rating & reviews
    modal.querySelector('.m-rating')?.replaceChildren(document.createTextNode(expert.rating));
    modal.querySelector('.m-reviews')?.replaceChildren(document.createTextNode(`(${expert.reviews} reviews)`));

    // Meta fields
    const set = (sel, val) => { const el = modal.querySelector(sel); if (el) el.textContent = val || '–'; };
    set('#m-location-top', expert.location);
    set('#m-years-exp', expert.yearsExp);
    set('#m-projects', expert.projects);
    set('#m-years', expert.yearsExp);
    set('#m-lang-stat', expert.languages);

    // Platform logos (header area)
    const platformLogos = modal.querySelector('#m-platform-logos');
    if (platformLogos) {
        const p = String(expert.platform || '').toLowerCase();
        const link = String(expert.link || '');
        const hasFiverr = p.includes('fiverr') || link.includes('fiverr');
        const hasUpwork = p.includes('upwork') || link.includes('upwork');
        let html = '<span class="sb-platform-agency">&#127968; Agency</span>';
        if (hasFiverr) html += '<span class="sb-platform-tag sb-fiverr">fiverr</span>';
        if (hasUpwork) html += '<span class="sb-platform-tag sb-upwork">upwork</span>';
        platformLogos.innerHTML = html;
    }

    // Skills
    const skillsList = modal.querySelector('.m-skills');
    if (skillsList) {
        skillsList.innerHTML = (expert.skills || []).map(s => `<span class="m-skill-tag">${s}</span>`).join('');
    }

    // Portfolio
    const renderPortfolioThumb = (file, height = 120) => {
        const lower = String(file).toLowerCase();
        const isVideo = lower.endsWith('.webm') || lower.endsWith('.mp4') || lower.endsWith('.mkv');
        const isPdf = lower.endsWith('.pdf');
        const preview = isPdf
            ? `<div style="height:100%;width:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);color:#ddd;font-weight:900;letter-spacing:1px;"><span style="border:1px solid rgba(255,255,255,0.14);padding:10px 14px;border-radius:12px;">PDF</span></div>`
            : (isVideo ? `<video src="${file}" autoplay loop muted style="width:100%;height:100%;object-fit:cover;"></video>` : `<img src="${file}" style="width:100%;height:100%;object-fit:cover;">`);
        return `<button type="button" class="m-portfolio-item" style="height:${height}px;width:100%;padding:0;background:transparent;cursor:pointer;border-radius:10px;overflow:hidden;" onclick="openPortfolioViewer('${file.replace(/'/g, "\\'")}', '${String(expert.name).replace(/'/g, "\\'")}')">
            ${preview}
        </button>`;
    };

    const fullPortGrid = modal.querySelector('#m-full-portfolio-grid');
    if (fullPortGrid) {
        fullPortGrid.innerHTML = expert.portfolio.map(f => renderPortfolioThumb(f, 130)).join('');
    }

    // Reviews — expand to match expert.reviews total
    const baseReviews = Array.isArray(expert.testimonials) ? expert.testimonials : [];
    const reviewCount = parseInt(expert.reviews, 10) || baseReviews.length;
    set('#m-total-reviews-count', `${reviewCount} Reviews`);
    const tabCountEl = modal.querySelector('#m-reviews-tab-count');
    if (tabCountEl) tabCountEl.textContent = reviewCount;

    // Unique Filler Review Generation
    const poolNames = ["Sarah L.", "Michael R.", "Emma W.", "David K.", "Linda P.", "Carlos M.", "Sophia G.", "James T.", "Elena R.", "Mark S.", "Rachel K.", "John D.", "Liam H.", "Noah J.", "Olivia B.", "Ava S.", "William F.", "Isabella Q.", "Ethan G.", "Mia K.", "Benjamin T.", "Charlotte V.", "Lucas P.", "Amelia R.", "Mason D.", "Harper G.", "Logan F.", "Evelyn B.", "Alexander H.", "Abigail W."];
    const poolFlags = ["US", "GB", "CA", "AU", "DE", "ES", "FR", "NZ", "IT", "IE", "SG", "NL", "CH", "SE", "NO", "DK", "FI", "BE", "AT", "PT"];
    const poolTexts = [
        "Exceptional quality and communication throughout the project. Truly a professional.",
        "Great results, very professional approach to solving our complex business issues.",
        "The delivery exceeded our expectations. Highly recommended for any serious work!",
        "Top-tier work. The attention to detail is truly impressive and delivery was fast.",
        "Good experience overall, the technical skill is definitely there and easy to work with.",
        "Fantastic engineering. Solved our bottleneck issues perfectly and efficiently.",
        "A brilliant partner for any high-stakes digital project. Very reliable.",
        "Very reliable and fast. We will certainly work together again on future projects.",
        "Excellent communication and perfect execution on the requirements provided.",
        "One of the best experts we've hired. Professional, dedicated, and very skilled.",
        "Quality delivery and good response time. Very satisfied with the final result.",
        "Strong technical knowledge and very helpful suggestions for our workflow.",
        "The best experience I've had on this platform. Total professional.",
        "Highly technical and capable. Handled our project with great care.",
        "Clear communication and very high standard of work. Will hire again.",
        "Exactly what we needed. Fast turnaround and great quality control.",
        "Impressive depth of knowledge and very pleasant to collaborate with.",
        "They took our vision and made it even better. Outstanding results.",
        "Punctual, professional, and very good at what they do.",
        "A true expert in their field. The results speak for themselves."
    ];

    // Build expanded list: start with real reviews then fill with varied extras
    const reviews = [...baseReviews];
    const overallRating = parseFloat(expert.rating) || 5.0;

    // Seeding logic to ensure each expert gets unique but consistent reviews
    const seed = expert.name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    const getPoolItem = (pool, idx) => pool[Math.abs(seed + idx) % pool.length];

    if (reviews.length < reviewCount) {
        for (let i = reviews.length; i < reviewCount; i++) {
            const fi = i - baseReviews.length;
            const rName = getPoolItem(poolNames, fi * 3);
            
            // Weighted flags: 40% US, 30% UK, 1% Nigeria, 29% others
            const roll = Math.abs(seed + fi * 13) % 100;
            let rFlagCode = "";
            if (roll < 40) rFlagCode = "US";
            else if (roll < 70) rFlagCode = "GB";
            else if (roll < 71) rFlagCode = "NG";
            else rFlagCode = getPoolItem(poolFlags, fi * 7);
            const rFlag = flag(rFlagCode);

            const rText = getPoolItem(poolTexts, fi * 11);
            const rTime = (fi + 1) + (fi === 0 ? " week ago" : " weeks ago");
            
            // Logic for individual review rating based on overall expert rating
            let rScore = "5.0";
            if (overallRating >= 4.99) {
                // For 5.0 experts: reviews are 4.9 or 5.0
                rScore = (fi % 3 === 0) ? "4.9" : "5.0";
            } else if (overallRating >= 4.89) {
                // For 4.9 experts: reviews are 4.8, 4.9, or 5.0
                const v = ["4.8", "4.9", "5.0"];
                rScore = v[fi % v.length];
            } else {
                // For 4.8 experts: reviews are 4.7, 4.8, 4.9, or 5.0
                const v = ["4.7", "4.8", "4.9", "5.0"];
                rScore = v[fi % v.length];
            }

            reviews.push({ 
                name: rName, 
                flag: rFlag, 
                time: rTime, 
                text: rText, 
                rating: rScore 
            });
        }
    }

    const renderReviewCard = (r) => {
        return `
        <div class="m-review-card">
            <div class="rev-head">
                <div class="rev-avatar">${(r.name || '?').slice(0, 1).toUpperCase()}</div>
                <div class="rev-head-info">
                    <div class="rev-name-row">
                        <span class="rev-name">${r.name || 'Client'}</span>
                        ${r.flag ? `<span class="rev-flag" style="margin-left:6px; font-size:1.1rem;">${r.flag}</span>` : ''}
                    </div>
                    <div class="rev-meta-row">
                        <span class="rev-stars" style="color:var(--primary-yellow); font-size:0.85rem;">${'★'.repeat(Math.round(Number(r.rating) || 5))}</span>
                        <span class="rev-rating-num">${r.rating}</span>
                        ${r.time ? `<span class="rev-time">· ${r.time}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="rev-text" style="color:#ccc; font-size:0.9rem; line-height:1.5; margin-top:10px;">${r.text || ''}</div>
        </div>`;
    };

    const recentReviews = modal.querySelector('#m-reviews-list');
    const allReviews = modal.querySelector('#m-full-reviews-list');
    if (recentReviews) recentReviews.innerHTML = reviews.slice(0, 3).map(renderReviewCard).join('');
    if (allReviews) allReviews.innerHTML = reviews.map(renderReviewCard).join('');

    // View all reviews button
    const viewAllBtn = modal.querySelector('#m-view-all-reviews-btn');
    if (viewAllBtn) {
        viewAllBtn.onclick = () => window.switchExpertTab('reviews');
    }

    // Footer platform buttons
    const platformBtns = modal.querySelector('#m-platform-btns');
    if (platformBtns) {
        const p = String(expert.platform || '').toLowerCase();
        const link = String(expert.link || '');
        const fiverrLink = String(expert.fiverrLink || '');
        
        const hasFiverr = p.includes('fiverr') || link.includes('fiverr') || fiverrLink.includes('fiverr');
        const hasUpwork = p.includes('upwork') || link.includes('upwork');
        
        let fiverrUrl = fiverrLink || (link.includes('fiverr') ? link : '');
        let upworkUrl = link.includes('upwork') ? link : (p.includes('upwork') ? link : '');
        
        // If we still don't have an Upwork URL but the platform says Upwork, 
        // and 'link' doesn't contain fiverr, use 'link' as upworkUrl
        if (hasUpwork && !upworkUrl && link && !link.includes('fiverr')) {
            upworkUrl = link;
        }

        let btns = '';
        if (hasFiverr && fiverrUrl) {
            btns += `<a href="${fiverrUrl}" target="_blank" rel="noopener" class="sb-plat-btn sb-plat-fiverr"><span style="font-size:1.1rem;">f</span> Fiverr</a>`;
        }
        if (hasUpwork && upworkUrl) {
            btns += `<a href="${upworkUrl}" target="_blank" rel="noopener" class="sb-plat-btn sb-plat-upwork"><span style="font-size:1.1rem;">u</span> Upwork</a>`;
        }
        
        // Populate both desktop and mobile containers
        const btnsAlt = modal.querySelector('.m-platform-btns-alt');
        if (btnsAlt) {
            btnsAlt.innerHTML = btns || '<span style="color:#888;font-size:0.85rem;">Available through Agency</span>';
        }
        
        if (platformBtns) {
            platformBtns.innerHTML = btns || '<span style="color:#888;font-size:0.85rem;">Available through Agency</span>';
        }
    }

    modal.classList.add('open');
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
        backdrop.style.opacity = '1';
        backdrop.style.pointerEvents = 'auto';
    }
    document.body.style.overflow = 'hidden';
    window.switchExpertTab?.('overview');
};

window.openExpertModal = openExpertModal;
window.closeExpertModal = () => {
    const modal = document.getElementById('expert-modal');
    if (modal) modal.classList.remove('open');
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
        backdrop.style.opacity = '0';
        backdrop.style.pointerEvents = 'none';
    }
    document.body.style.overflow = '';
};

const initExpertModal = () => {
    const modal = document.getElementById('expert-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.m-close') || modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.onclick = closeExpertModal;

    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeExpertModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal && modal.classList.contains('open')) closeExpertModal();
    });

    // Handle "Start Project" button in modal
    const startBtn = document.getElementById('m-start-project-btn');
    const briefOverlay = document.getElementById('brief-overlay');
    if (startBtn && briefOverlay) {
        startBtn.onclick = async (e) => {
            e.preventDefault();

            // Authentication Check
            if (typeof supabaseClient === 'undefined') {
                alert('Authentication system still loading. Please try again in a moment.');
                return;
            }

            const { data: { session } } = await supabaseClient.auth.getSession();

            if (!session) {
                localStorage.setItem('pending_expert_id', currentExpertId);
                alert('Please sign up or log in to start a project with our experts!');
                window.location.href = 'login.html';
                return;
            }

            // If authenticated, show project brief overlay
            window.closeExpertModal?.();
            briefOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };
    }
};

window.closeExpertModal = () => {
    const modal = document.getElementById('expert-modal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.classList.remove('open');
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
        backdrop.style.opacity = '0';
        backdrop.style.pointerEvents = 'none';
    }
    document.body.style.overflow = 'auto';
};

const closeExpertModal = window.closeExpertModal;

window.switchExpertTab = (tab) => {
    const modal = document.getElementById('expert-modal');
    if (!modal) return;
    const tabs = Array.from(modal.querySelectorAll('.m-tab'));
    const panes = {
        overview: modal.querySelector('#m-tab-overview'),
        portfolio: modal.querySelector('#m-tab-portfolio'),
        reviews: modal.querySelector('#m-tab-reviews'),
        services: modal.querySelector('#m-tab-services')
    };
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    Object.entries(panes).forEach(([k, el]) => {
        if (!el) return;
        const isActive = k === tab;
        el.classList.toggle('active', isActive);
        el.style.display = isActive ? 'block' : 'none';
    });
};

const initExpertTabs = () => {
    const modal = document.getElementById('expert-modal');
    if (!modal) return;
    modal.querySelectorAll('.m-tab').forEach(btn => {
        btn.addEventListener('click', () => window.switchExpertTab(btn.dataset.tab));
    });
    modal.querySelectorAll('[data-jump-tab]').forEach(el => {
        el.addEventListener('click', () => window.switchExpertTab(el.getAttribute('data-jump-tab')));
    });
};

// ── PORTFOLIO VIEWER (image/pdf/video + watermark) ───────────────────────────────
const ensurePortfolioViewer = () => {
    let viewer = document.getElementById('portfolio-viewer');
    if (viewer) return viewer;

    viewer = document.createElement('div');
    viewer.id = 'portfolio-viewer';
    viewer.style.cssText = 'display:none; position: fixed; inset: 0; z-index: 10050; background: rgba(0,0,0,0.92); backdrop-filter: blur(8px); align-items: center; justify-content: center; padding: 20px;';
    viewer.innerHTML = `
        <button id="portfolio-viewer-close" style="position:absolute; top: 22px; right: 22px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: #fff; font-size: 28px; cursor: pointer; line-height: 0;">&times;</button>
        <div id="portfolio-viewer-frame" style="position: relative; width: min(1100px, 96vw); height: min(720px, 86vh); border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); background: rgba(10,10,10,0.9); box-shadow: 0 30px 90px rgba(0,0,0,0.6);">
            <div id="portfolio-viewer-content" style="position:absolute; inset: 0; display:flex; align-items:center; justify-content:center;"></div>
            <div id="portfolio-viewer-watermark" style="position:absolute; inset:0; pointer-events:none; opacity:0.22; mix-blend-mode: screen;"></div>
        </div>
    `;
    document.body.appendChild(viewer);
    return viewer;
};

const setPortfolioWatermark = (text) => {
    const wm = document.getElementById('portfolio-viewer-watermark');
    if (!wm) return;
    const safe = String(text || 'THE GENIUS AGENCY • CONFIDENTIAL').replace(/</g, '&lt;');
    const pattern = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="260">
            <defs>
                <style>
                    text{font-family: Inter, Arial, sans-serif; font-size:22px; font-weight:800; fill: rgba(245,197,66,0.85);}
                </style>
            </defs>
            <g transform="rotate(-25 210 130)">
                <text x="10" y="80">${safe}</text>
                <text x="10" y="160">${safe}</text>
            </g>
        </svg>`
    );
    wm.style.backgroundImage = `url("data:image/svg+xml,${pattern}")`;
    wm.style.backgroundRepeat = 'repeat';
    wm.style.backgroundSize = '420px 260px';
};

window.openPortfolioViewer = (file, expertName = '') => {
    const viewer = ensurePortfolioViewer();
    const content = document.getElementById('portfolio-viewer-content');
    if (!content) return;

    const src = String(file || '');
    const lower = src.toLowerCase();
    const watermarkText = `THE GENIUS AGENCY • ${expertName || 'CONFIDENTIAL'} • DO NOT COPY`;
    setPortfolioWatermark(watermarkText);

    content.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute; inset:0; display:flex; align-items:center; justify-content:center;';

    if (lower.endsWith('.pdf')) {
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.title = 'Portfolio PDF';
        iframe.style.cssText = 'width:100%; height:100%; border:0; background:#111;';
        wrap.appendChild(iframe);
    } else if (lower.endsWith('.webm') || lower.endsWith('.mp4') || lower.endsWith('.mkv')) {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.playsInline = true;
        video.style.cssText = 'width:100%; height:100%; object-fit:contain; background:#000;';
        wrap.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Portfolio item';
        img.style.cssText = 'width:100%; height:100%; object-fit:contain; background:#0b0b0b;';
        wrap.appendChild(img);
    }

    content.appendChild(wrap);
    viewer.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const close = () => {
        viewer.style.display = 'none';
        content.innerHTML = '';
        document.body.style.overflow = 'auto';
    };

    document.getElementById('portfolio-viewer-close')?.addEventListener('click', close, { once: true });
    viewer.addEventListener('click', (e) => { if (e.target === viewer) close(); }, { once: true });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, { once: true });
};

// ── PROJECT BRIEF SUBMISSION ───────────────────────────────
const initBriefSubmission = () => {
    const briefOverlay = document.getElementById('brief-overlay');
    const briefForm = document.getElementById('brief-form');
    const closeBriefBtn = document.getElementById('close-brief-btn');
    if (!briefOverlay || !briefForm || !closeBriefBtn) return;

    closeBriefBtn.onclick = () => briefOverlay.style.display = 'none';
    briefOverlay.onclick = (e) => { if (e.target === briefOverlay) briefOverlay.style.display = 'none'; };

    briefForm.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = briefForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Processing...';
        submitBtn.disabled = true;

        const data = {
            title: document.getElementById('brief-title').value,
            description: document.getElementById('brief-desc').value,
            budget: document.getElementById('brief-budget').value || null
        };

        const allExperts = Array.isArray(experts) ? experts : [];
        const expert = allExperts.find(e => e.id === currentExpertId);
        const expertName = expert ? expert.name : 'General Agency';

        try {
            // Check for user session - safely
            let user = null;
            try {
                const sb = getSupabase();
                if (sb && sb.auth) {
                    const { data } = await sb.auth.getSession();
                    user = data?.session?.user || null;
                }
            } catch (authErr) {
                console.log('Auth check failed:', authErr);
            }

            // Fallback: check localStorage for supabase auth tokens
            if (!user) {
                const supabaseToken = localStorage.getItem('sb-tjxyxasorunhrtvstwpa-auth-token');
                if (supabaseToken) {
                    try {
                        const parsed = JSON.parse(supabaseToken);
                        user = parsed?.user || null;
                    } catch (e) {
                        console.log('Failed to parse auth token');
                    }
                }
            }

            // If still not logged in, store brief and redirect to login
            if (!user) {
                localStorage.setItem('pending_brief', JSON.stringify({ ...data, expert_id: currentExpertId }));
                alert('Please sign up or log in to submit your project.');
                window.location.href = 'login.html';
                return;
            }

            // Create conversation in Supabase for admin inbox
            const sb = getSupabase();
            console.log('Supabase client:', sb ? 'available' : 'not available');
            console.log('User ID:', user.id);

            if (!sb) {
                console.error('Supabase client not available');
                alert('Unable to connect to server. Please refresh the page and try again.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Get expert info
            const expert = experts.find(e => e.id === currentExpertId);
            const expertName = expert ? expert.name : 'Any Expert';
            console.log('Submitting for expert:', expertName);

            // Try Supabase first, but fallback to localStorage if it fails
            let convoId = null;

            try {
                if (sb) {
                    console.log('INSERTING with user.id:', user.id, 'email:', user.email);
                    
                    // Map expert name to ID for foreign key
                    let dbExpertId = null;
                    if (currentExpertId && !currentExpertId.startsWith('exp-')) {
                        dbExpertId = currentExpertId; // It's a real UUID
                    } else if (expert) {
                        // If it's a hardcoded ID, try to find the DB ID if we loaded them
                        // (loadDynamicExperts should have updated the experts list with DB IDs)
                        dbExpertId = expert.id && !expert.id.startsWith('exp-') ? expert.id : null;
                    }

                    // Create conversation
                    const { data: convo, error: convoErr } = await sb.from('conversations').insert({
                        client_id: user.id,
                        expert_id: dbExpertId,
                        status: 'new_lead'
                    }).select().single();

                    if (convoErr) {
                        console.error('Conversation insert FAILED:', convoErr);
                        alert('Admin panel error: ' + (convoErr.message || JSON.stringify(convoErr)).substring(0, 200));
                    } else if (convo) {
                        convoId = convo.id;
                        console.log('✅ Conversation created:', convoId);

                        // Create initial message
                        const { error: msgErr } = await sb.from('messages').insert({
                            conversation_id: convoId,
                            sender_id: user.id,
                            sender_role: 'client',
                            content: `📋 PROJECT REQUEST\n\nTitle: ${data.title}\nBudget: ${data.budget || 'Not specified'}\n\nDescription:\n${data.description}\n\n👤 Requested Expert: ${expertName}`,
                            message_type: 'normal'
                        });

                        if (msgErr) {
                            console.error('Message insert FAILED:', msgErr);
                            alert('Message failed: ' + (msgErr.message || JSON.stringify(msgErr)));
                        } else {
                            console.log('Message created - Admin should see this now!');
                            alert('Message sent!');
                        }
                    }
                }
            } catch (sbErr) {
                console.error('❌ Supabase exception:', sbErr);
                alert('Database error: ' + (sbErr?.message || sbErr).substring(0, 200));
            }

            // Always store in localStorage for client dashboard (works even if Supabase fails)
            const pendingProjects = JSON.parse(localStorage.getItem('pending_projects') || '[]');
            pendingProjects.push({
                ...data,
                expert_id: currentExpertId,
                expert_name: expertName,
                client_id: user.id,
                conversation_id: convoId || 'local-' + Date.now(),
                status: 'pending',
                created_at: new Date().toISOString(),
                is_local_only: !convoId // Flag to know it's only in localStorage
            });
            localStorage.setItem('pending_projects', JSON.stringify(pendingProjects));

            // Show success and redirect
            alert('Message sent! Redirecting to your messages...');
            briefOverlay.style.display = 'none';
            window.location.href = 'client/chat.html';
            return;
        } catch (err) {
            console.error("Submission Error:", err);
            // On any error, store brief and redirect to login
            localStorage.setItem('pending_brief', JSON.stringify({ ...data, expert_id: currentExpertId }));
            alert('Please sign up or log in to submit your project.');
            window.location.href = 'login.html';
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    };
};


// ── PAGE RENDERING ───────────────────────────────
const renderExperts = () => {
    const grid = document.getElementById('experts-grid');
    if (!grid) return;
    grid.innerHTML = experts.map(exp => `
        <div class="glass reveal" style="padding: 30px; position: relative;">
            <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px;">
                <img src="${exp.image}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
                <div>
                    <h3 style="margin: 0; font-size: 1.2rem; margin-bottom: 5px;">${exp.name}</h3>
                    <p style="color: var(--primary-yellow); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">${exp.categories[0]}</p>
                </div>
            </div>
            <p style="color: #888; font-size: 0.9rem; margin-bottom: 25px;">${exp.desc}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary-yellow); letter-spacing: 1px;">
                    ${renderStars(exp.rating)} <span style="color:#fff; margin-left:4px;">${parseFloat(exp.rating).toFixed(1)}</span>
                </span>
                <button onclick="openExpertModal('${exp.id}')" class="btn btn-outline" style="padding: 8px 16px; font-size: 0.8rem;">View Profile</button>
            </div>
        </div>
    `).join('');
    if (typeof initReveal === 'function') initReveal();
};

const renderPortfolios = () => {
    // portfolio.html manages its own static grid — do not overwrite it
    if (isPortfolioPage) return;

    const grid = document.getElementById('portfolio-grid') || document.getElementById('homepage-portfolio');
    if (!grid) return;

    // On home page, only show 3 videos for 3-side-by-side
    let displayItems = portfolioItems;
    if (isHome) {
        displayItems = portfolioItems.filter(item => item.video).slice(0, 3);
    }

    grid.innerHTML = displayItems.map(item => `
        <div class="glass reveal" style="padding: 20px;">
            <div style="height: 250px; overflow: hidden; border-radius: 12px; margin-bottom: 20px; cursor: pointer;" ${item.video ? `onclick="openVideoModal('${item.video}')"` : ''}>
                ${item.video ? `<video src="${item.video}" autoplay loop muted style="width: 100%; height: 100%; object-fit: cover;"></video>` : `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;">`}
                ${item.video ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.5); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; pointer-events: none;"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>` : ''}
            </div>
            <p class="text-yellow" style="font-size: 0.7rem; font-weight: 800; letter-spacing: 1px;">${item.category}</p>
            <h3 style="font-size: 1.1rem; margin-top: 5px;">${item.title}</h3>
        </div>
    `).join('');
    if (typeof initReveal === 'function') initReveal();
};

// ── EXPERTS DIRECTORY (team.html) ───────────────────────────────
const initExpertsDirectory = () => {
    if (!isTeamPage) return;

    const grid = document.getElementById('team-grid');
    const pagination = document.getElementById('experts-pagination');
    const countEl = document.getElementById('experts-count');
    if (!grid) return;

    const state = {
        categories: new Set(),
        platforms: new Set(),
        availableOnly: false,
        topCategory: 'All',
        topPlatform: 'All',
        topAvailability: 'All',
        sort: 'topRated',
        q: '',
        page: 1,
        perPage: 8
    };

    const normalize = (s) => String(s || '').toLowerCase().trim();

    const isAvailable = (exp) => normalize(exp.availability).includes('available');

    const matchesPlatform = (exp, platform) => {
        const p = normalize(platform);
        if (p === 'fiverr') return normalize(exp.platform).includes('fiverr') || normalize(exp.link).includes('fiverr');
        if (p === 'upwork') return normalize(exp.platform).includes('upwork') || normalize(exp.link).includes('upwork');
        return true;
    };

    const applyFilters = () => {
        let list = [...experts];

        const q = normalize(state.q);
        if (q) {
            list = list.filter(e => {
                const cats = (e.categories || [e.category]).join(' ');
                const hay = `${e.name} ${e.role} ${cats} ${(e.skills || []).join(' ')}`.toLowerCase();
                return hay.includes(q);
            });
        }

        const cats = new Set([...state.categories]);
        if (state.topCategory !== 'All') cats.add(state.topCategory);
        if (cats.size) list = list.filter(e => {
            const expCats = e.categories || [e.category];
            return expCats.some(cat => cats.has(cat));
        });

        const platforms = new Set([...state.platforms]);
        if (state.topPlatform !== 'All') platforms.add(state.topPlatform);
        if (platforms.size) list = list.filter(e => [...platforms].some(p => matchesPlatform(e, p)));

        const availableOnly = state.availableOnly || state.topAvailability === 'available';
        if (availableOnly) list = list.filter(isAvailable);

        if (state.sort === 'name') {
            list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
        } else {
            // Default: Custom Agency Order (Jeremiah, Bukola, Cecilia, etc.)
            const order = ["exp-7", "exp-6", "exp-2", "exp-1", "exp-3", "exp-4", "exp-5"];
            list.sort((a, b) => {
                const ai = order.indexOf(a.id);
                const bi = order.indexOf(b.id);
                if (ai === -1 && bi === -1) return 0;
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
            });
        }

        return list;
    };

    const renderPagination = (total, page) => {
        if (!pagination) return;
        const pages = Math.max(1, Math.ceil(total / state.perPage));
        const safePage = Math.min(Math.max(1, page), pages);
        state.page = safePage;

        const btn = (p, label = String(p), extra = '') =>
            `<button class="page-btn ${p === safePage ? 'active' : ''}" type="button" data-page="${p}" ${extra}>${label}</button>`;

        const items = [];
        if (pages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        const start = Math.max(1, safePage - 2);
        const end = Math.min(pages, safePage + 2);

        if (safePage > 1) items.push(btn(safePage - 1, '‹'));
        if (start > 1) items.push(btn(1, '1'));
        if (start > 2) items.push(`<span style="padding: 0 6px; color: rgba(0,0,0,0.55); font-weight: 900;">…</span>`);

        for (let p = start; p <= end; p++) items.push(btn(p));

        if (end < pages - 1) items.push(`<span style="padding: 0 6px; color: rgba(0,0,0,0.55); font-weight: 900;">…</span>`);
        if (end < pages) items.push(btn(pages, String(pages)));
        if (safePage < pages) items.push(btn(safePage + 1, '›'));

        pagination.innerHTML = items.join('');
        pagination.querySelectorAll('[data-page]').forEach(b => {
            b.addEventListener('click', () => {
                state.page = Number(b.getAttribute('data-page')) || 1;
                paint();
                document.getElementById('experts-directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    };

    const renderCards = (list) => {
        const start = (state.page - 1) * state.perPage;
        const pageItems = list.slice(start, start + state.perPage);

        grid.innerHTML = pageItems.map(exp => {
            const tags = (exp.skills || []).map(s => `<span class="tag">${s}</span>`).join('');
            const available = isAvailable(exp);
            return `
                <div class="minimal-expert-card reveal" role="button" tabindex="0" onclick="window.openExpertModal('${exp.id}')">
                    <div class="img-container">
                        ${available ? `<div class="avail-badge">Available</div>` : ``}
                        <img src="${exp.image}" alt="${exp.name}">
                    </div>
                    <div class="card-body">
                        <h3>${exp.name}</h3>
                        <p style="color: var(--primary-yellow); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; margin-top: 5px;">${exp.categories[0]}</p>
                        <div class="tags">${tags}</div>
                        <div class="card-footer" style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; width: 100%;">
                            <div class="rating" style="display: flex; align-items: center; gap: 5px; font-weight: 800; color: #fff; font-size: 0.95rem;">
                                <span style="color: var(--primary-yellow); font-size: 1.1rem; letter-spacing: -2px;">${renderStars(exp.rating)}</span> 
                                <span style="margin-left: 3px;">${parseFloat(exp.rating).toFixed(1)}</span>
                            </div>
                            <div class="arrow-cta" 
                                 onclick="event.stopPropagation(); if(window.openExpertModal) window.openExpertModal('${exp.id}')"
                                 style="width: 44px; height: 44px; background: var(--primary-yellow); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 4px 15px rgba(245,197,66,0.2);"
                                 onmouseover="this.style.transform='translateX(5px) scale(1.1)'; this.style.boxShadow='0 8px 25px rgba(245,197,66,0.4)';"
                                 onmouseout="this.style.transform='translateX(0) scale(1)'; this.style.boxShadow='0 4px 15px rgba(245,197,66,0.2)';"
                                 title="View Profile">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (typeof initReveal === 'function') initReveal();

        grid.querySelectorAll('.minimal-expert-card').forEach(card => {
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    };

    const paint = () => {
        const filtered = applyFilters();
        const pages = Math.max(1, Math.ceil(filtered.length / state.perPage));
        state.page = Math.min(state.page, pages);

        if (countEl) countEl.textContent = `Showing ${filtered.length} experts`;
        renderCards(filtered);
        renderPagination(filtered.length, state.page);
    };

    const bind = () => {
        document.querySelectorAll('.filter-category').forEach(cb => {
            cb.addEventListener('change', () => {
                const v = cb.value;
                if (cb.checked) state.categories.add(v);
                else state.categories.delete(v);
                state.page = 1;
                paint();
            });
        });
        document.querySelectorAll('.filter-platform').forEach(cb => {
            cb.addEventListener('change', () => {
                const v = cb.value;
                if (cb.checked) state.platforms.add(v);
                else state.platforms.delete(v);
                state.page = 1;
                paint();
            });
        });
        const availCb = document.getElementById('filter-available');
        if (availCb) {
            availCb.addEventListener('change', () => {
                state.availableOnly = Boolean(availCb.checked);
                state.page = 1;
                paint();
            });
        }

        const topCategory = document.getElementById('top-category');
        if (topCategory) topCategory.addEventListener('change', () => { state.topCategory = topCategory.value; state.page = 1; paint(); });
        const topPlatform = document.getElementById('top-platform');
        if (topPlatform) topPlatform.addEventListener('change', () => { state.topPlatform = topPlatform.value; state.page = 1; paint(); });
        const topAvailability = document.getElementById('top-availability');
        if (topAvailability) topAvailability.addEventListener('change', () => { state.topAvailability = topAvailability.value; state.page = 1; paint(); });
        const topSort = document.getElementById('top-sort');
        if (topSort) topSort.addEventListener('change', () => { state.sort = topSort.value; state.page = 1; paint(); });
        const topSearch = document.getElementById('top-search');
        if (topSearch) topSearch.addEventListener('input', () => { state.q = topSearch.value; state.page = 1; paint(); });
    };

    bind();
    paint();
};

// ── VIDEO MODAL SYSTEM ───────────────────────────────
window.openVideoModal = (src) => {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('modal-video-player');
    if (!modal || !player) return;

    player.src = src;
    modal.style.display = 'flex';
    player.play();
    document.body.style.overflow = 'hidden';
};

const initVideoModal = () => {
    const modal = document.getElementById('video-modal');
    const closeBtn = document.getElementById('close-video');
    const player = document.getElementById('modal-video-player');
    if (!modal || !closeBtn || !player) return;

    const close = () => {
        modal.style.display = 'none';
        player.pause();
        player.src = "";
        document.body.style.overflow = 'auto';
    };

    closeBtn.onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
};

let expertsSwiper = null;
const initExpertsSwiper = () => {
    const track = document.getElementById('experts-track');
    if (!track) return;

    // Destroy existing instance if it exists
    if (expertsSwiper) {
        expertsSwiper.destroy(true, true);
        expertsSwiper = null;
    }

    track.innerHTML = experts.map(exp => `
        <div class="swiper-slide premium-expert-card">
            <div class="expert-card glass" style="padding: 40px; border-radius: 24px; text-align: center; height: 100%; display: flex; flex-direction: column; align-items: center;">
                <div style="position: relative; margin-bottom: 25px;">
                    <img src="${exp.image}" onerror="this.src='Freelancer Photos/default.png'" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-yellow);">
                    <div style="position: absolute; bottom: 0; right: 0; background: var(--primary-yellow); color: black; font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 100px;">${parseFloat(exp.rating).toFixed(1)} ★</div>
                </div>
                <h3 style="font-size: 1.5rem; margin-bottom: 8px; color: white;">${exp.name}</h3>
                <p style="color: var(--primary-yellow); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px;">${exp.categories[0]}</p>
                <p style="color: #888; font-size: 0.9rem; margin-bottom: 30px; line-height: 1.6;">${exp.desc}</p>
                <div style="margin-top: auto; width: 100%;">
                    <button onclick="event.preventDefault(); event.stopPropagation(); window.openExpertModal('${exp.id}')" 
                            class="btn btn-outline swiper-no-swiping" 
                            style="width: 100%; padding: 12px 20px; font-size: 0.85rem; letter-spacing: 0.5px; border-radius: 100px; cursor: pointer; position: relative; z-index: 10;">
                        View Full Profile
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Check if Swiper is loaded
    if (typeof Swiper !== 'undefined') {
        expertsSwiper = new Swiper('.experts-swiper', {
            slidesPerView: 'auto',
            centeredSlides: true,
            centerInsufficientSlides: true,
            spaceBetween: 40,
            loop: true,
            autoplay: { delay: 4000, disableOnInteraction: true },
            speed: 650,
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            slideToClickedSlide: false,
            noSwiping: true,
            noSwipingClass: 'swiper-no-swiping',
            breakpoints: {
                0: { spaceBetween: 20 },
                768: { spaceBetween: 30 },
                1100: { spaceBetween: 40 }
            }
        });
    }
};

// ── ENSURE MODAL HTML EXISTS ON ANY PAGE ───────────────────────────────
const ensureExpertModal = () => {
    const existing = document.getElementById('expert-modal');
    if (existing && existing.querySelector('.m-platform-btns-alt')) return;
    if (existing) existing.remove();

    // Inject backdrop
    if (!document.getElementById('modal-backdrop')) {
        const bd = document.createElement('div');
        bd.id = 'modal-backdrop';
        bd.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(3px);z-index:9000;opacity:0;pointer-events:none;transition:opacity 0.3s;';
        bd.onclick = () => window.closeExpertModal?.();
        document.body.appendChild(bd);
    }

    const el = document.createElement('div');
    el.id = 'expert-modal';
    el.className = 'expert-sidebar';
    el.innerHTML = `
        <div class="sb-header">
            <span class="sb-title">EXPERT PROFILE</span>
            <button class="m-close sb-close" type="button" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="modal-scroll-area">
            <div class="sb-profile-top">
                <div class="sb-avatar-wrap">
                    <img class="m-img sb-avatar" src="" alt="Expert">
                    <span class="sb-avail-badge">&#x2714; Available</span>
                </div>
                <h2 class="m-name sb-name">Name
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#F5C542" stroke="#000" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
                </h2>
                <div class="m-role sb-role">Role</div>
                <div class="sb-meta-row">
                    <span class="sb-rating">&#9733; <span class="m-rating">5.0</span> <span class="m-reviews sb-rev-count">(0 reviews)</span></span>
                    <span class="sb-meta-dot"></span>
                    <span class="sb-loc">&#128205; <span id="m-location-top">–</span></span>
                </div>

            </div>
            <div class="modal-tabs sb-tabs">
                <button class="m-tab active" data-tab="overview" type="button">Overview</button>
                <button class="m-tab" data-tab="reviews" type="button">Reviews (<span id="m-reviews-tab-count">0</span>)</button>
                <button class="m-tab" data-tab="services" type="button">Services</button>
            </div>
            <div class="modal-body-content">
                <div id="m-tab-overview" class="m-tab-pane active" style="display:block;">
                    <h3 class="sb-section-title">About Me</h3>
                    <p class="m-bio sb-bio"></p>
                    <div id="m-services-overview-wrap" style="margin-top:20px;">
                        <h3 class="sb-section-title">Service Highlights</h3>
                        <p id="m-services-overview" style="font-size:0.88rem;color:#ccc;line-height:1.6;"></p>
                    </div>
                    <div class="sb-stats-row">
                        <div class="sb-stat-box"><strong id="m-projects">–</strong><span>Projects Completed</span></div>
                        <div class="sb-stat-box"><strong id="m-years">–</strong><span>Years Experience</span></div>
                        <div class="sb-stat-box"><strong>98%</strong><span>Success Rate</span></div>
                        <div class="sb-stat-box"><strong id="m-lang-stat">–</strong><span>Languages</span></div>
                    </div>
                    <h3 class="sb-section-title">Skills & Tools</h3>
                    <div class="m-skills sb-skills"></div>
                    <div class="sb-recent-reviews">
                        <div class="sb-section-header">
                            <h3 class="sb-section-title" style="margin:0;">Recent Reviews</h3>
                            <button class="sb-view-all-btn" id="m-view-all-reviews-btn" type="button">View all reviews &rarr;</button>
                        </div>
                        <div id="m-reviews-list" class="sb-reviews-list"></div>
                    </div>
                </div>
                <div id="m-tab-reviews" class="m-tab-pane" style="display:none;">
                    <div class="sb-reviews-note">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-yellow)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        <span>Reviews include feedback from clients both on and outside of Fiverr / Upwork.</span>
                    </div>
                    <div class="sb-section-header" style="margin-bottom:16px;">
                        <h3 class="sb-section-title" style="margin:0;">All Client Reviews</h3>
                        <span id="m-total-reviews-count" style="color:var(--primary-yellow);font-weight:700;font-size:0.85rem;">0 Reviews</span>
                    </div>
                    <div id="m-full-reviews-list" class="sb-reviews-list"></div>
                </div>
                <div id="m-tab-services" class="m-tab-pane" style="display:none;">
                    <h3 class="sb-section-title">Detailed Services</h3>
                    <div id="m-services-list" class="sb-services-list"></div>
                </div>
            </div>
        </div>
        <div class="sb-footer">
            <div id="m-mobile-platforms" class="mobile-only-container" style="margin-bottom:15px;">
                <p class="sb-or-label" style="margin-bottom:8px !important;">WORK WITH THEM ON</p>
                <div class="sb-platform-btns m-platform-btns-alt"></div>
            </div>
            <div class="sb-cta-block">
                <p class="sb-cta-label">Start Your Project With Us</p>
                <p class="sb-cta-sub">Work with this expert through our agency for a smooth, secure and quality experience.</p>
                <a href="#" id="m-start-project-btn" class="btn btn-primary sb-start-btn">Start Project With Us &rarr;</a>
            </div>
            <div class="desktop-only">
                <p class="sb-or-label">OR WORK WITH THEM ON</p>
                <div class="sb-platform-btns" id="m-platform-btns"></div>
            </div>
        </div>
    `;
    document.body.appendChild(el);
};

// ── HANDLE URL PARAMS ON TEAM PAGE ───────────────────────────────
const handleTeamPageParams = () => {
    if (!isTeamPage) return;
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const expertId = params.get('expert');

    if (category) {
        // Wait for directory to render then apply filter
        setTimeout(() => {
            const topCategory = document.getElementById('top-category');
            if (topCategory) {
                topCategory.value = category;
                topCategory.dispatchEvent(new Event('change'));
            }
            // If a specific expert was requested, open their modal
            if (expertId) {
                setTimeout(() => openExpertModal(expertId), 400);
            }
        }, 300);
    } else if (expertId) {
        setTimeout(() => openExpertModal(expertId), 400);
    }
};

// 4. INITIALIZATION
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Structural setup
    ensureExpertModal();
    initExpertModal();
    initExpertTabs();
    initVideoModal();
    initBriefSubmission();

    // 2. Async Data Loading (Wait for DB before first render to prevent flash)
    await loadDynamicExperts();

    // 3. Data Rendering
    renderExperts();
    renderPortfolios();
    initExpertsSwiper();
    initExpertsDirectory(); // This calls paint() internally

    // 4. Visibility Layer
    setTimeout(() => {
        initReveal();
        initHeroSlider(); 
        handleTeamPageParams();
    }, 50);
});

// ── COUPON MODAL LOGIC ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const couponBtn = document.getElementById('view-coupon-btn');
    const couponModal = document.getElementById('coupon-modal');
    const closeCoupon = document.getElementById('close-coupon');

    if (couponBtn && couponModal) {
        couponBtn.addEventListener('click', async () => {
            // Check for Supabase session via the global client exposed by nav-auth.js
            if (typeof supabaseClient === 'undefined') {
                alert('Authentication system still loading. Please try again in a moment.');
                return;
            }

            const { data: { session } } = await supabaseClient.auth.getSession();

            if (!session) {
                alert('Please sign up or log in to view the exclusive discount coupon!');
                window.location.href = 'login.html';
                return;
            }
            couponModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeCoupon) {
        closeCoupon.addEventListener('click', () => {
            couponModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (couponModal) {
        couponModal.addEventListener('click', (e) => {
            if (e.target === couponModal) {
                couponModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});
