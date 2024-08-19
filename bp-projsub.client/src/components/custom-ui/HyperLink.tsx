import { Link } from 'react-router-dom';

interface HyperlinkProps {
    link: string;
    text: string;
}

export default function Hyperlink({link, text}: HyperlinkProps) {
    return ( 
        <Link className="underline underline-offset-4 hover:text-primary pl-1" to={link}>{text}</Link>
     );
}



