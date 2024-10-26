type Props = {
    text: string;
};
export const MutedInfo = ({ text }: Props) => <p className="text-muted-foreground">{text}</p>;
