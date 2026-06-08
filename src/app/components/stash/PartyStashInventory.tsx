import { useEffect, useRef, type MouseEvent } from "react";
import type { InventoryRow, InventorySection } from "../../../party/inventory-prep.js";
import { deleteStashItem, editStashItem } from "../../../party/stash-item-controls.js";
import { StashInventoryRoot } from "./PartyStash.styles.js";

interface PartyStashInventoryProps {
  sections: InventorySection[];
  stashActorId: string;
  canEdit: boolean;
  title: string;
  onItemsChanged: () => void;
}

function loc(key: string): string {
  const text = game.i18n.localize(key);
  return text === key ? key : text;
}

function ItemControlsHeader({ canEdit }: { canEdit: boolean }) {
  if (!canEdit) return null;
  return <div className="item-controls" />;
}

function ItemControlsRow({
  canEdit,
  itemId,
  stashActorId,
  onItemsChanged,
}: {
  canEdit: boolean;
  itemId: string;
  stashActorId: string;
  onItemsChanged: () => void;
}) {
  if (!canEdit) return null;

  const handleEdit = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void editStashItem(stashActorId, itemId);
  };

  const handleDelete = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void deleteStashItem(stashActorId, itemId).then((deleted) => {
      if (deleted) onItemsChanged();
    });
  };

  return (
    <div className="item-controls flexrow">
      <a
        className="item-control item-edit"
        data-tooltip={loc("DND4E.ItemEdit")}
        aria-label={loc("DND4E.ItemEdit")}
        onClick={handleEdit}
      >
        <i className="fas fa-edit" />
      </a>
      <a
        className="item-control item-delete"
        data-tooltip={loc("DND4E.ItemDelete")}
        aria-label={loc("DND4E.ItemDelete")}
        onClick={handleDelete}
      >
        <i className="fas fa-trash" />
      </a>
    </div>
  );
}

function SectionHeader({ section, canEdit }: { section: InventorySection; canEdit: boolean }) {
  const type = section.id;

  return (
    <div className="items-header flexrow">
      <h3 className="group-name">{section.label}</h3>

      {type === "weapon" ? (
        <div className="item-detail item-slot">{loc("Fox4e.Hand.Label")}</div>
      ) : null}
      {type === "equipment" ? (
        <div className="item-detail item-slot">{loc("Fox4e.Slot")}</div>
      ) : null}

      {type !== "loot" ? (
        <div className="item-detail item-level">{loc("Fox4e.LevelAbbr")}</div>
      ) : null}

      {type === "loot" ? (
        <div className="item-detail item-price">{loc("DND4E.Value")}</div>
      ) : null}

      {type !== "weapon" && type !== "equipment" ? (
        <div className="item-detail item-quantity">{loc("Fox4e.Qty")}</div>
      ) : null}

      {type !== "loot" ? (
        <div className="item-detail item-uses">{loc("DND4E.Charges")}</div>
      ) : null}

      <div className="item-detail item-weight">{loc("Fox4e.WeightAbbr")}</div>

      <ItemControlsHeader canEdit={canEdit} />
    </div>
  );
}

function InventoryItemRow({
  section,
  item,
  canEdit,
  stashActorId,
  onItemsChanged,
}: {
  section: InventorySection;
  item: InventoryRow;
  canEdit: boolean;
  stashActorId: string;
  onItemsChanged: () => void;
}) {
  const type = section.id;
  const depleted = item.isDepleted ? " depleted" : "";

  return (
    <li
      className={`item gear item-card ${type} ${type}-card collapsible collapsed${depleted}`}
      data-item-id={item.id}
    >
      <div className="flexrow item-header feature-header">
        <div className="item-image item-roll rollable roll-d20">
          <img src={item.img} width={26} height={26} alt="" />
        </div>

        <div className="item-name rollable">
          <h4 className="item-title">{item.name}</h4>
        </div>

        {type === "weapon" ? (
          <div className="item-detail item-slot">{item.slotLabel}</div>
        ) : null}
        {type === "equipment" ? (
          <div className="item-detail item-slot">{item.slotLabel}</div>
        ) : null}

        {type !== "loot" ? (
          <div className="item-detail item-level">{item.level ?? ""}</div>
        ) : null}

        {type === "loot" ? (
          <div className="item-detail item-price">{item.price ?? ""}</div>
        ) : null}

        {type !== "weapon" && type !== "equipment" ? (
          <div className="item-detail item-quantity">{item.quantity}</div>
        ) : null}

        {type !== "loot" ? (
          <div className="item-detail item-uses">
            {item.hasUses ? (
              <>
                {item.usesValue} / {item.preparedMaxUses}
              </>
            ) : null}
          </div>
        ) : null}

        <div className="item-detail item-weight">
          {item.totalWeightLabel ? item.totalWeightLabel : ""}
        </div>

        <ItemControlsRow
          canEdit={canEdit}
          itemId={item.id}
          stashActorId={stashActorId}
          onItemsChanged={onItemsChanged}
        />
      </div>

      <div className="item-summary collapsible-content">
        <div className="wrapper">
          <div className="card-content" />
        </div>
      </div>
    </li>
  );
}

export function PartyStashInventory({
  sections,
  stashActorId,
  canEdit,
  title,
  onItemsChanged,
}: PartyStashInventoryProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = listRef.current?.closest(".party-stash-inventory");
    if (!root) return;
    for (const row of root.querySelectorAll<HTMLElement>(".item.gear")) {
      row.draggable = canEdit;
    }
  }, [canEdit, sections]);

  return (
    <StashInventoryRoot className="party-stash-inventory party-fox-inventory-host">
      <section className="main flexcol">
        <section className="tabs-content">
          <div className="tab inventory active" data-group="primary" data-tab="inventory">
            <h2 className="tab-title">{title}</h2>
            <ul className="item-list gear" ref={listRef}>
              {sections.map((section) => (
                <li key={section.id} className={`item-group ${section.id}`}>
                  <SectionHeader section={section} canEdit={canEdit} />
                  <ul className="items-list">
                    {section.items.map((item) => (
                      <InventoryItemRow
                        key={item.id}
                        section={section}
                        item={item}
                        canEdit={canEdit}
                        stashActorId={stashActorId}
                        onItemsChanged={onItemsChanged}
                      />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </StashInventoryRoot>
  );
}
