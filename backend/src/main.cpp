#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

// ── JSON helpers ──────────────────────────────────────────────────────────────

string vecToJson(const vector<int>& v) {
    string r = "[";
    for (size_t i = 0; i < v.size(); i++) {
        r += to_string(v[i]);
        if (i + 1 < v.size()) r += ",";
    }
    return r + "]";
}

string indicesJson(initializer_list<int> idx) {
    string r = "[";
    bool first = true;
    for (int i : idx) { if (!first) r += ","; r += to_string(i); first = false; }
    return r + "]";
}

string step(const string& type,
            const string& indicesStr,
            const string& msg,
            const vector<int>& arr,
            const vector<int>& sorted,
            const string& extra = "") {
    string s = "  {";
    s += "\"type\":\"" + type + "\",";
    s += "\"indices\":" + indicesStr + ",";
    s += "\"message\":\"" + msg + "\",";
    s += "\"array\":" + vecToJson(arr) + ",";
    s += "\"sortedIndices\":" + vecToJson(sorted);
    if (!extra.empty()) s += "," + extra;
    s += "}";
    return s;
}

// ── Bubble Sort ───────────────────────────────────────────────────────────────

void bubbleSort(vector<int> a) {
    vector<int> sorted;
    int n = a.size();
    vector<string> steps;

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            steps.push_back(step("COMPARE",
                indicesJson({j, j+1}),
                "Comparing " + to_string(a[j]) + " and " + to_string(a[j+1]),
                a, sorted));

            if (a[j] > a[j+1]) {
                swap(a[j], a[j+1]);
                steps.push_back(step("SWAP",
                    indicesJson({j, j+1}),
                    "Swapped! " + to_string(a[j+1]) + " is greater than " + to_string(a[j]),
                    a, sorted));
            }
        }
        sorted.push_back(n - i - 1);
        steps.push_back(step("SORTED",
            indicesJson({n-i-1}),
            to_string(a[n-i-1]) + " is now sorted.",
            a, sorted));
    }

    cout << "[\n";
    for (size_t i = 0; i < steps.size(); i++) {
        cout << steps[i];
        if (i + 1 < steps.size()) cout << ",";
        cout << "\n";
    }
    cout << "]\n";
}

// ── Selection Sort ────────────────────────────────────────────────────────────

void selectionSort(vector<int> a) {
    vector<int> sorted;
    int n = a.size();
    vector<string> steps;

    for (int i = 0; i < n; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            steps.push_back(step("COMPARE",
                indicesJson({minIdx, j}),
                "Comparing " + to_string(a[minIdx]) + " (current min) with " + to_string(a[j]),
                a, sorted));

            if (a[j] < a[minIdx]) {
                minIdx = j;
                steps.push_back(step("SET",
                    indicesJson({minIdx}),
                    "New minimum found: " + to_string(a[minIdx]) + " at index " + to_string(minIdx),
                    a, sorted));
            }
        }

        if (minIdx != i) {
            swap(a[i], a[minIdx]);
            steps.push_back(step("SWAP",
                indicesJson({i, minIdx}),
                "Swapping " + to_string(a[minIdx]) + " and minimum " + to_string(a[i]),
                a, sorted));
        }

        sorted.push_back(i);
        steps.push_back(step("SORTED",
            indicesJson({i}),
            to_string(a[i]) + " is now in its correct place.",
            a, sorted));
    }

    cout << "[\n";
    for (size_t i = 0; i < steps.size(); i++) {
        cout << steps[i];
        if (i + 1 < steps.size()) cout << ",";
        cout << "\n";
    }
    cout << "]\n";
}

// ── Insertion Sort ────────────────────────────────────────────────────────────

void insertionSort(vector<int> a) {
    vector<int> sorted = {0};
    int n = a.size();
    vector<string> steps;

    steps.push_back(step("SORTED",
        indicesJson({0}),
        "First element " + to_string(a[0]) + " is considered sorted.",
        a, sorted));

    for (int i = 1; i < n; i++) {
        int key = a[i];
        int j = i - 1;

        steps.push_back(step("SET",
            indicesJson({i}),
            "Selected " + to_string(key) + " to be inserted in the sorted portion.",
            a, sorted));

        while (j >= 0 && a[j] > key) {
            steps.push_back(step("COMPARE",
                indicesJson({j, j+1}),
                to_string(a[j]) + " is greater than " + to_string(key) + ", shifting right.",
                a, sorted));

            a[j+1] = a[j];

            steps.push_back(step("OVERWRITE",
                indicesJson({j+1}),
                "Shifted to index " + to_string(j+1) + ".",
                a, sorted));

            j--;
        }

        a[j+1] = key;
        sorted.push_back(i);

        steps.push_back(step("SORTED",
            indicesJson({j+1}),
            "Inserted " + to_string(key) + " into its sorted position.",
            a, sorted));
    }

    cout << "[\n";
    for (size_t i = 0; i < steps.size(); i++) {
        cout << steps[i];
        if (i + 1 < steps.size()) cout << ",";
        cout << "\n";
    }
    cout << "]\n";
}

// ── Linear Search ─────────────────────────────────────────────────────────────

void linearSearch(vector<int> a, int target) {
    vector<int> sorted;
    vector<string> steps;

    for (size_t i = 0; i < a.size(); i++) {
        steps.push_back(step("COMPARE",
            indicesJson({(int)i}),
            "Checking if " + to_string(a[i]) + " == " + to_string(target),
            a, sorted));

        if (a[i] == target) {
            steps.push_back(step("FOUND",
                indicesJson({(int)i}),
                "Target " + to_string(target) + " found at index " + to_string(i) + "!",
                a, sorted));
            break;
        }
    }

    // Check if last step was NOT_FOUND scenario
    bool found = false;
    for (auto& x : a) if (x == target) { found = true; break; }
    if (!found) {
        steps.push_back(step("NOT_FOUND",
            "[]",
            "Target " + to_string(target) + " was not found in the array.",
            a, sorted));
    }

    cout << "[\n";
    for (size_t i = 0; i < steps.size(); i++) {
        cout << steps[i];
        if (i + 1 < steps.size()) cout << ",";
        cout << "\n";
    }
    cout << "]\n";
}

// ── Binary Search ─────────────────────────────────────────────────────────────

void binarySearch(vector<int> a, int target) {
    vector<int> sorted;
    vector<string> steps;

    int left = 0, right = (int)a.size() - 1;
    bool found = false;

    while (left <= right) {
        int mid = (left + right) / 2;
        string rangeExtra = "\"range\":[" + to_string(left) + "," + to_string(right) + "]";

        steps.push_back(step("COMPARE",
            indicesJson({mid}),
            "Searching between index " + to_string(left) + " and " + to_string(right) +
            ". Mid is index " + to_string(mid) + " (" + to_string(a[mid]) + ").",
            a, sorted, rangeExtra));

        if (a[mid] == target) {
            steps.push_back(step("FOUND",
                indicesJson({mid}),
                "Target " + to_string(target) + " found at index " + to_string(mid) + "!",
                a, sorted, rangeExtra));
            found = true;
            break;
        } else if (a[mid] < target) {
            steps.push_back(step("SET",
                indicesJson({mid}),
                to_string(a[mid]) + " is less than " + to_string(target) + ", discarding left half.",
                a, sorted, rangeExtra));
            left = mid + 1;
        } else {
            steps.push_back(step("SET",
                indicesJson({mid}),
                to_string(a[mid]) + " is greater than " + to_string(target) + ", discarding right half.",
                a, sorted, rangeExtra));
            right = mid - 1;
        }
    }

    if (!found) {
        steps.push_back(step("NOT_FOUND",
            "[]",
            "Target " + to_string(target) + " was not found.",
            a, sorted));
    }

    cout << "[\n";
    for (size_t i = 0; i < steps.size(); i++) {
        cout << steps[i];
        if (i + 1 < steps.size()) cout << ",";
        cout << "\n";
    }
    cout << "]\n";
}

// ── Entry point ───────────────────────────────────────────────────────────────

int main(int argc, char* argv[]) {
    if (argc < 3) {
        cerr << "Usage: algorithms <algorithm> <space-separated-numbers> [target]" << endl;
        return 1;
    }

    string algo = argv[1];

    // Parse array from argv[2]
    vector<int> arr;
    istringstream ss(argv[2]);
    int num;
    while (ss >> num) arr.push_back(num);

    if (arr.empty()) {
        cout << "[]\n";
        return 0;
    }

    int target = (argc >= 4) ? stoi(argv[3]) : 0;

    if      (algo == "bubbleSort")    bubbleSort(arr);
    else if (algo == "selectionSort") selectionSort(arr);
    else if (algo == "insertionSort") insertionSort(arr);
    else if (algo == "linearSearch")  linearSearch(arr, target);
    else if (algo == "binarySearch")  binarySearch(arr, target);
    else { cout << "[]\n"; return 1; }

    return 0;
}
