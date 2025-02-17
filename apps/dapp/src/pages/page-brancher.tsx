import AuctionListPage from "./auction-list-page";
import AuctionPage, { AuctionPageLoading } from "./auction-page";
import { useAuctions } from "modules/auction/hooks/use-auctions";

export function PageBrancher() {
  const auctionQuery = useAuctions();

  let element;

  if (auctionQuery.isLoading) {
    element = <AuctionPageLoading />;
  } else {
    const auction = auctionQuery.data[0];
    element = auctionQuery.isMultiple ? (
      <AuctionListPage />
    ) : (
      <AuctionPage auction={auction} />
    );
  }

  return <div id="__AXIS_HOME_PAGE__">{element}</div>;
}
