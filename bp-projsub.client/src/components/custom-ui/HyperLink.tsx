import { Link } from 'react-router-dom';

interface HyperlinkProps {
    link: string;
    text: string;
}

export function ReactRouterLink({link, text}: HyperlinkProps) {
    return ( 
        <Link className="underline underline-offset-4 hover:text-primary pl-1" to={link}>{text}</Link>
     );
}

export function HrefLink({link, text}: HyperlinkProps) {
    return ( 
        <a className="underline underline-offset-4 hover:text-primary pl-1" href={link}>{text}</a>
     );
}


