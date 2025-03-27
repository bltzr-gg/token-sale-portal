import { Dialog, DialogContent, DialogHeader, Text } from "@bltzr-gg/ui";
import { useNavigate } from "react-router-dom";
import { ReferralLinkCard } from "./referral-link-card";

export function ReferralLinkDialog() {
  const navigate = useNavigate();
  return (
    <Dialog open={true} onOpenChange={() => navigate(-1)}>
      <DialogContent className="bg-light">
        <DialogHeader>
          <Text
            mono
            size="md"
            uppercase
            className="leading-none tracking-[0.1em]"
          >
            Refer users
          </Text>
        </DialogHeader>
        <ReferralLinkCard />
      </DialogContent>
    </Dialog>
  );
}
