type Props = {
    text: string;
};
export const MutedInfo = ({ text }: Props) => {
    return <p className="text-muted-foreground">{text}</p>;
};
