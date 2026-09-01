import styled from "styled-components";

export const CurrencyBar = styled.div.attrs({ className: "party-stash-currency flexrow" })`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: ${({ theme }) => theme.spacingGutter};
  padding: 6px 8px;
  background: ${({ theme }) => theme.cardSurface};
  border: 1px solid ${({ theme }) => theme.borderCard};
  box-shadow: ${({ theme }) => theme.shadowElement};
  color: ${({ theme }) => theme.colourTextOnLight};
`;

export const CurrencyCells = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  flex: 1 1 auto;
  min-width: 0;
`;

export const CurrencyDivider = styled.span`
  align-self: stretch;
  width: 1px;
  margin: 2px 10px;
  background: ${({ theme }) => theme.colourPrimary100};
  font-size: 0;
  user-select: none;
`;

export const CurrencyCell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;

  i {
    font-size: 14px;
    width: 20px;
    text-align: center;
  }

  i.coin-cp {
    color: #8b5a2b;
  }
  i.coin-sp {
    color: #9ca3af;
  }
  i.coin-gp {
    color: #c9a227;
  }
  i.coin-pp {
    color: #6b7b8c;
  }
  i.coin-ad {
    color: #5eb8d4;
  }
  i.coin-rs {
    color: #9b6dd7;
  }
`;

export const CurrencyActions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  flex: 0 0 auto;
`;

export const CurrencyButton = styled.button`
  width: 24px;
  height: 24px;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${({ theme }) => theme.radiusBadge};
  background: ${({ theme }) => theme.colourPcHead};
  color: #fff;
  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(1.15);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
