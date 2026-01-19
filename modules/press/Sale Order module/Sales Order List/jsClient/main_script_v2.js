class AutoSelectManager {
  constructor() {
    this.dataIndex = new Map();
  }

  /**
   * Initialize auto-select functionality for checkboxes
   * @param {string} blockNo - Block number
   * @param {string} chkBoxElementName - Checkbox element name
   * @param {string} mainItem - Main item column name (e.g., VOUCHER_NO, PO_NO)
   * @param {string} searchConditionName - Search condition name (e.g., SELECTED)
   * @returns {string} Comma-separated selected items
   */
  init(blockNo, chkBoxElementName, mainItem, searchConditionName) {
    this.dataIndex.clear();
    this.searchConditionName = searchConditionName;
    this.blockNo = blockNo;
    this.chkBoxElementName = chkBoxElementName;
    this.mainItem = mainItem;
    
    const chkBoxPrefix = `${blockNo}_${chkBoxElementName}_`;
    const itemPrefix = `${blockNo}_${mainItem}_`;
    const selectedItems = new Set();

    let index = 0;
    while (true) {
      const checkbox = this._getElement(chkBoxPrefix + index);
      const itemInput = this._getElement(itemPrefix + index);
      
      if (!checkbox || !itemInput) break;

      const itemValue = itemInput.title;
      
      // Build index
      if (!this.dataIndex.has(itemValue)) {
        this.dataIndex.set(itemValue, []);
      }
      this.dataIndex.get(itemValue).push(checkbox);

      // Attach event listener once
      this._attachListener(checkbox, itemValue);

      // Track selected items
      if (checkbox.checked) selectedItems.add(itemValue);
      
      index++;
    }

    // Update search condition
    return this._updateSearchCondition(selectedItems);
  }

  /**
   * Select all checkboxes with the same item value
   */
  selectItem(item) {
    this._toggleItem(item, true);
    this._updateSearchConditionFromCurrent();
  }

  /**
   * Unselect all checkboxes with the same item value
   */
  unselectItem(item) {
    this._toggleItem(item, false);
    this._updateSearchConditionFromCurrent();
  }

  /**
   * Get all selected items
   */
  getSelectedItems() {
    const selected = new Set();
    for (const [item, checkboxes] of this.dataIndex) {
      if (checkboxes.some(cb => cb.checked)) {
        selected.add(item);
      }
    }
    return Array.from(selected);
  }

  /**
   * Handler for row change events
   * เรียกใช้เมื่อมีการเปลี่ยนแปลงใน row
   */
  handleRowChange(event) {
    const checkbox = event.target.closest('.selectionTableRow')?.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    // ค้นหา item value จาก checkbox
    const checkboxName = checkbox.name;
    const match = checkboxName.match(new RegExp(`${this.blockNo}_${this.chkBoxElementName}_(\\d+)`));
    
    if (match) {
      const index = match[1];
      const itemInput = this._getElement(`${this.blockNo}_${this.mainItem}_${index}`);
      
      if (itemInput) {
        const itemValue = itemInput.title;
        
        if (checkbox.checked) {
          this.selectItem(itemValue);
        } else {
          this.unselectItem(itemValue);
        }
      }
    }
  }

  /**
   * Attach row listeners to elements with class 'selectionTableRow'
   */
  attachRowListeners() {
    const rows = document.getElementsByClassName("selectionTableRow");
    
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].dataset.rowListenerAttached) {
        rows[i].addEventListener("change", (e) => this.handleRowChange(e));
        rows[i].dataset.rowListenerAttached = "true";
      }
    }
  }

  // Private methods
  _getElement(name) {
    return document.getElementsByName(name)[0];
  }

  _attachListener(checkbox, itemValue) {
    if (checkbox.dataset.listenerAttached) return;

    checkbox.addEventListener("change", (e) => {
      if (e?.isProgrammatic) return;
      
      if (checkbox.checked) {
        this.selectItem(itemValue);
      } else {
        this.unselectItem(itemValue);
      }
    });

    checkbox.dataset.listenerAttached = "true";
  }

  _toggleItem(item, checked) {
    const checkboxes = this.dataIndex.get(item);
    if (!checkboxes) return;

    checkboxes.forEach(checkbox => {
      if (checkbox.checked !== checked) {
        checkbox.checked = checked;
        const event = new Event("change");
        event.isProgrammatic = true;
        checkbox.dispatchEvent(event);
      }
    });
  }

  _updateSearchCondition(selectedItems) {
    const value = Array.from(selectedItems).join(",");
    const conditionInput = this._getElement(`CNDTN_${this.searchConditionName}`);
    
    if (conditionInput) {
      conditionInput.value = value;
    }
    
    return value;
  }

  _updateSearchConditionFromCurrent() {
    const selectedItems = new Set(this.getSelectedItems());
    return this._updateSearchCondition(selectedItems);
  }
}



// ใช้ใน resizeContents_end()
function resizeContents_end() {
  autoSelect.attachRowListeners();
}