export default function Branding({title = "Vidstack Player", logo = "https://media.discordapp.net/attachments/1018251990624641044/1067154803068764170/RLcAMyjL_400x400-removebg-preview.png", href = "https://www.vidstack.io/"}) {
    return <a
    target="_blank"
    href={href}
    rel="noopener noreferrer"
>
    <div className="vidstackLogoWrapper">
        <img
            className="vidstackLogo"
            src={logo}
            alt=""
        />
        <h4 className="vidstackTitle">{title}</h4>
        <span className="material-symbols-outlined">
            chevron_right
        </span>
    </div>
</a>
}